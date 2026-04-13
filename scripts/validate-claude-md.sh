#!/usr/bin/env bash
# ==============================================================================
# validate-claude-md.sh
# Valida un file CLAUDE.md verificando struttura, contenuto e sicurezza.
#
# Uso: ./scripts/validate-claude-md.sh [percorso/CLAUDE.md]
#      Se non specificato, cerca CLAUDE.md nella directory corrente.
#
# Exit code: 0 = tutto ok, 1 = errori trovati
# ==============================================================================

set -euo pipefail

# --- Colori ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # Reset

# --- Contatori ---
ERRORS=0
WARNINGS=0
PASSES=0

# --- Funzioni di output ---
pass() {
    echo -e "  ${GREEN}✓${NC} $1"
    PASSES=$((PASSES + 1))
}

fail() {
    echo -e "  ${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

info() {
    echo -e "  ${CYAN}ℹ${NC} $1"
}

# --- Help ---
show_help() {
    cat <<'EOF'
Uso: validate-claude-md.sh [OPZIONI] [FILE]

Valida un file CLAUDE.md verificando struttura, contenuto e sicurezza.

Argomenti:
  FILE    Percorso al file CLAUDE.md (default: ./CLAUDE.md)

Opzioni:
  -h, --help    Mostra questo messaggio di aiuto

Check eseguiti:
  1. Esistenza e contenuto del file
  2. Sezioni obbligatorie (## Progetto, ## Convenzioni o equivalenti)
  3. Lunghezza (warning > 200 righe, errore > 300 righe)
  4. Assenza di segreti (password, secret, token, api_key con valori)
  5. Assenza di TODO/FIXME/HACK
  6. Sintassi markdown (header coerenti, no heading skip)

Exit code:
  0  Tutti i check superati (possibili warning)
  1  Almeno un errore trovato
EOF
    exit 0
}

# --- Parsing argomenti ---
FILE=""
for arg in "$@"; do
    case "$arg" in
        -h|--help)
            show_help
            ;;
        *)
            FILE="$arg"
            ;;
    esac
done

# Default: CLAUDE.md nella directory corrente
if [[ -z "$FILE" ]]; then
    FILE="CLAUDE.md"
fi

echo ""
echo -e "${BOLD}Validazione di ${CYAN}${FILE}${NC}"
echo -e "${BOLD}$(printf '%.0s─' {1..60})${NC}"

# =============================================================================
# CHECK 1: Il file esiste e non e' vuoto
# =============================================================================
echo ""
echo -e "${BOLD}1. Esistenza e contenuto${NC}"

if [[ ! -f "$FILE" ]]; then
    fail "Il file '$FILE' non esiste"
    echo ""
    echo -e "${RED}${BOLD}Validazione interrotta: file non trovato.${NC}"
    exit 1
fi
pass "Il file esiste"

if [[ ! -s "$FILE" ]]; then
    fail "Il file e' vuoto"
    echo ""
    echo -e "${RED}${BOLD}Validazione interrotta: file vuoto.${NC}"
    exit 1
fi
pass "Il file non e' vuoto"

# =============================================================================
# CHECK 2: Sezioni obbligatorie
# =============================================================================
echo ""
echo -e "${BOLD}2. Sezioni obbligatorie${NC}"

# Cerca ## Progetto (o varianti: Progetto, Project, Descrizione, Description, Overview)
if grep -qiE '^#{1,2}\s+(progetto|project|descrizione|description|overview)' "$FILE"; then
    pass "Sezione Progetto trovata"
else
    fail "Sezione Progetto mancante (atteso: ## Progetto o equivalente)"
fi

# Cerca ## Convenzioni (o varianti: Convenzioni, Conventions, Regole, Rules, Stile, Style)
if grep -qiE '^#{1,2}\s+(convenzioni|conventions|regole|rules|stile|style|guidelines)' "$FILE"; then
    pass "Sezione Convenzioni trovata"
else
    fail "Sezione Convenzioni mancante (atteso: ## Convenzioni o equivalente)"
fi

# =============================================================================
# CHECK 3: Lunghezza del file
# =============================================================================
echo ""
echo -e "${BOLD}3. Lunghezza del file${NC}"

LINE_COUNT=$(wc -l < "$FILE" | tr -d ' ')

if (( LINE_COUNT > 300 )); then
    fail "Il file ha ${LINE_COUNT} righe (limite: 300)"
elif (( LINE_COUNT > 200 )); then
    warn "Il file ha ${LINE_COUNT} righe (consigliato: max 200)"
else
    pass "Il file ha ${LINE_COUNT} righe (entro il limite)"
fi

# =============================================================================
# CHECK 4: Assenza di segreti
# =============================================================================
echo ""
echo -e "${BOLD}4. Controllo segreti${NC}"

# Pattern: chiave = valore o chiave: valore (esclude placeholder e commenti)
SECRET_PATTERNS='(password|secret|token|api_key|apikey|api-key|private_key)\s*[:=]\s*["\x27]?[A-Za-z0-9+/=_-]{8,}'

SECRETS_FOUND=$(grep -inE "$SECRET_PATTERNS" "$FILE" 2>/dev/null | grep -viE '(esempio|example|placeholder|xxx|your[_-]|<.*>|\.\.\.)' || true)

if [[ -n "$SECRETS_FOUND" ]]; then
    fail "Possibili segreti trovati:"
    while IFS= read -r line; do
        echo -e "      ${RED}riga ${line}${NC}"
    done <<< "$SECRETS_FOUND"
else
    pass "Nessun segreto rilevato"
fi

# =============================================================================
# CHECK 5: Assenza di TODO/FIXME/HACK
# =============================================================================
echo ""
echo -e "${BOLD}5. Controllo TODO/FIXME/HACK${NC}"

TODO_FOUND=$(grep -nE '\b(TODO|FIXME|HACK)\b' "$FILE" 2>/dev/null || true)

if [[ -n "$TODO_FOUND" ]]; then
    fail "Trovati marcatori di lavoro incompleto:"
    while IFS= read -r line; do
        echo -e "      ${YELLOW}riga ${line}${NC}"
    done <<< "$TODO_FOUND"
else
    pass "Nessun TODO/FIXME/HACK trovato"
fi

# =============================================================================
# CHECK 6: Sintassi markdown
# =============================================================================
echo ""
echo -e "${BOLD}6. Sintassi markdown${NC}"

MARKDOWN_OK=true

# 6a. Verifica heading skip (es. ## seguito da #### senza ###)
# Raccoglie i livelli di heading in ordine
HEADING_LEVELS=()
while IFS= read -r line; do
    # Conta i # iniziali
    hashes="${line%%[^#]*}"
    level=${#hashes}
    if (( level >= 1 && level <= 6 )); then
        HEADING_LEVELS+=("$level")
    fi
done < <(grep -E '^#{1,6}\s+' "$FILE" 2>/dev/null || true)

SKIP_FOUND=false
for (( i=1; i<${#HEADING_LEVELS[@]}; i++ )); do
    curr=${HEADING_LEVELS[$i]}
    prev=${HEADING_LEVELS[$((i-1))]}
    # Un heading skip si verifica quando si scende di piu' di un livello
    if (( curr > prev + 1 )); then
        if [[ "$SKIP_FOUND" == false ]]; then
            fail "Heading skip rilevato (es. da H${prev} a H${curr})"
            MARKDOWN_OK=false
            SKIP_FOUND=true
        fi
    fi
done

if [[ "$SKIP_FOUND" == false ]]; then
    pass "Nessun heading skip rilevato"
fi

# 6b. Verifica che i header abbiano uno spazio dopo i #
BAD_HEADERS=$(grep -nE '^#{1,6}[^# ]' "$FILE" 2>/dev/null | grep -vE '^[0-9]+:#!' || true)

if [[ -n "$BAD_HEADERS" ]]; then
    fail "Header senza spazio dopo #:"
    while IFS= read -r line; do
        echo -e "      ${YELLOW}riga ${line}${NC}"
    done <<< "$BAD_HEADERS"
    MARKDOWN_OK=false
else
    pass "Tutti gli header hanno spazio dopo #"
fi

# 6c. Verifica che non ci siano heading di livello > 6
BAD_LEVEL=$(grep -nE '^#{7,}\s+' "$FILE" 2>/dev/null || true)

if [[ -n "$BAD_LEVEL" ]]; then
    fail "Heading con livello > 6 trovati:"
    while IFS= read -r line; do
        echo -e "      ${YELLOW}riga ${line}${NC}"
    done <<< "$BAD_LEVEL"
    MARKDOWN_OK=false
else
    pass "Livelli heading validi (1-6)"
fi

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo -e "${BOLD}$(printf '%.0s─' {1..60})${NC}"
echo -e "${BOLD}Riepilogo${NC}"
echo -e "  ${GREEN}✓ Superati:${NC}  ${PASSES}"
echo -e "  ${YELLOW}⚠ Warning:${NC}  ${WARNINGS}"
echo -e "  ${RED}✗ Errori:${NC}   ${ERRORS}"
echo ""

if (( ERRORS > 0 )); then
    echo -e "${RED}${BOLD}FALLITO${NC} — ${ERRORS} errore/i trovato/i."
    exit 1
else
    if (( WARNINGS > 0 )); then
        echo -e "${GREEN}${BOLD}SUPERATO${NC} ${YELLOW}con ${WARNINGS} warning.${NC}"
    else
        echo -e "${GREEN}${BOLD}SUPERATO${NC} — Tutti i check OK."
    fi
    exit 0
fi
