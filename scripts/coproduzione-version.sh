#!/bin/bash
# ==============================================================================
# coproduzione-version.sh
# Utility per leggere e scrivere il marker .claude/.coproduzione-version
# del manuale di co-produzione AI.
#
# Lo schema completo del marker e' documentato in
# template/coproduzione-version.SCHEMA.md (nel repo upstream del manuale).
#
# Dipendenze: jq, git
# ==============================================================================

set -euo pipefail

# --- Costanti ---
MARKER_RELATIVE_PATH=".claude/.coproduzione-version"

# --- Help ---
show_help() {
    cat <<'EOF'
Uso: coproduzione-version.sh <comando> [argomenti]

Utility per leggere e scrivere il marker .claude/.coproduzione-version
del manuale di co-produzione AI.

Comandi:
  get                       Stampa la versione corrente (campo "version")
  get-field <campo>         Stampa il valore di un campo specifico
  set <version>             Aggiorna il campo "version" (e ricalcola last_update_check)
  init <version>            Crea il marker da zero (fallback rispetto al SETUP-PROMPT)
  snooze <version>          Imposta snoozed_until_version
  check                     Stampa lo stato del marker; exit 0 se esiste, 1 se manca

Esempi:
  bash scripts/coproduzione-version.sh init 1.9.0
  bash scripts/coproduzione-version.sh get
  bash scripts/coproduzione-version.sh get-field skill_level
  bash scripts/coproduzione-version.sh set 1.9.1
  bash scripts/coproduzione-version.sh snooze 1.10.0
  bash scripts/coproduzione-version.sh check

Dipendenze: jq, git
EOF
    exit 0
}

# --- Verifica dipendenze ---
if ! command -v jq &>/dev/null; then
    echo "Errore: 'jq' non e' installato. Installalo con 'brew install jq' (macOS) o equivalente." >&2
    exit 2
fi

if ! command -v git &>/dev/null; then
    echo "Errore: 'git' non e' installato." >&2
    exit 2
fi

# --- Risolve la root del progetto (git toplevel) ---
resolve_project_root() {
    local root
    if root=$(git rev-parse --show-toplevel 2>/dev/null); then
        echo "$root"
    else
        # Fallback: directory corrente
        pwd
    fi
}

PROJECT_ROOT="$(resolve_project_root)"
MARKER_PATH="${PROJECT_ROOT}/${MARKER_RELATIVE_PATH}"

# --- Validatore SemVer (X.Y.Z, no prefisso "v") ---
validate_semver() {
    local v="$1"
    if [[ ! "$v" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "Errore: '$v' non e' una versione SemVer valida (atteso X.Y.Z senza prefisso 'v')." >&2
        exit 2
    fi
}

# --- Timestamp UTC ISO 8601 ---
now_utc() {
    date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# --- Verifica esistenza marker ---
require_marker() {
    if [[ ! -f "$MARKER_PATH" ]]; then
        echo "Errore: marker non trovato: ${MARKER_PATH}" >&2
        echo "Usa 'coproduzione-version.sh init <version>' per crearlo." >&2
        exit 1
    fi
}

# --- Comando: init ---
cmd_init() {
    local version="${1:-}"
    if [[ -z "$version" ]]; then
        echo "Errore: comando 'init' richiede argomento <version>." >&2
        echo "Uso: coproduzione-version.sh init <version>" >&2
        exit 2
    fi
    validate_semver "$version"

    # Assicura che la cartella .claude/ esista
    mkdir -p "$(dirname "$MARKER_PATH")"

    if [[ -f "$MARKER_PATH" ]]; then
        echo "Errore: marker gia' esistente: ${MARKER_PATH}" >&2
        echo "Per aggiornare la versione usa 'set <version>'." >&2
        exit 2
    fi

    local installed_at
    installed_at="$(now_utc)"

    jq -n \
        --arg version "$version" \
        --arg installed_at "$installed_at" \
        '{
            version: $version,
            installed_at: $installed_at,
            skill_level: "absent",
            modules_enabled: [],
            last_update_check: null,
            snoozed_until_version: null
        }' > "$MARKER_PATH"

    echo "Marker creato: ${MARKER_PATH}"
    echo "Versione: ${version}"
    echo "Installato: ${installed_at}"
}

# --- Comando: get ---
cmd_get() {
    require_marker
    jq -r '.version' "$MARKER_PATH"
}

# --- Comando: get-field ---
cmd_get_field() {
    local field="${1:-}"
    if [[ -z "$field" ]]; then
        echo "Errore: comando 'get-field' richiede argomento <campo>." >&2
        exit 2
    fi
    require_marker
    # Output null come stringa vuota? No: rispetta il JSON e stampa "null".
    jq -r --arg field "$field" '.[$field] // "null"' "$MARKER_PATH"
}

# --- Comando: set ---
cmd_set() {
    local version="${1:-}"
    if [[ -z "$version" ]]; then
        echo "Errore: comando 'set' richiede argomento <version>." >&2
        exit 2
    fi
    validate_semver "$version"
    require_marker

    local now
    now="$(now_utc)"

    local tmp
    tmp="$(mktemp)"
    jq \
        --arg version "$version" \
        --arg now "$now" \
        '.version = $version | .last_update_check = $now' \
        "$MARKER_PATH" > "$tmp"
    mv "$tmp" "$MARKER_PATH"

    echo "Versione aggiornata: ${version}"
    echo "Ultimo check: ${now}"
}

# --- Comando: snooze ---
cmd_snooze() {
    local version="${1:-}"
    if [[ -z "$version" ]]; then
        echo "Errore: comando 'snooze' richiede argomento <version>." >&2
        exit 2
    fi
    validate_semver "$version"
    require_marker

    local tmp
    tmp="$(mktemp)"
    jq --arg version "$version" '.snoozed_until_version = $version' "$MARKER_PATH" > "$tmp"
    mv "$tmp" "$MARKER_PATH"

    echo "Snooze impostato fino alla versione: ${version}"
}

# --- Comando: check ---
cmd_check() {
    if [[ ! -f "$MARKER_PATH" ]]; then
        echo "Marker assente: il manuale di co-produzione non e' installato in questo progetto."
        exit 1
    fi

    local version installed_at skill_level modules_enabled last_update_check snoozed_until_version

    version="$(jq -r '.version // "?"' "$MARKER_PATH")"
    installed_at="$(jq -r '.installed_at // "non registrato"' "$MARKER_PATH")"
    skill_level="$(jq -r '.skill_level // "non registrato"' "$MARKER_PATH")"
    modules_enabled="$(jq -r '(.modules_enabled // []) | if length == 0 then "nessuno" else join(", ") end' "$MARKER_PATH")"
    last_update_check="$(jq -r '.last_update_check // "mai"' "$MARKER_PATH")"
    snoozed_until_version="$(jq -r 'if (.snoozed_until_version // null) == null then "no" else .snoozed_until_version end' "$MARKER_PATH")"

    echo "Marker presente: ${MARKER_RELATIVE_PATH}"
    echo "Versione: ${version}"
    echo "Installato: ${installed_at}"
    echo "Skill level: ${skill_level}"
    echo "Moduli attivi: ${modules_enabled}"
    echo "Ultimo check: ${last_update_check}"
    echo "Snooze: ${snoozed_until_version}"
    exit 0
}

# --- Dispatch ---
if [[ $# -lt 1 ]]; then
    show_help
fi

cmd="$1"
shift || true

case "$cmd" in
    -h|--help|help)
        show_help
        ;;
    get)
        cmd_get "$@"
        ;;
    get-field)
        cmd_get_field "$@"
        ;;
    set)
        cmd_set "$@"
        ;;
    init)
        cmd_init "$@"
        ;;
    snooze)
        cmd_snooze "$@"
        ;;
    check)
        cmd_check "$@"
        ;;
    *)
        echo "Errore: comando sconosciuto: '${cmd}'" >&2
        echo "Usa '--help' per la lista dei comandi disponibili." >&2
        exit 2
        ;;
esac
