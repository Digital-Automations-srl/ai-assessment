#!/usr/bin/env bash
# =============================================================================
# Pre-Commit Hook — Sicurezza e Igiene (TEMPLATE)
# =============================================================================
#
# Hook pre-commit di esempio per progetti co-prodotti con AI.
# Verifica che non vengano committati segreti, file sensibili o binari pesanti.
#
# COME USARE QUESTO TEMPLATE:
# 1. Copia questo file in .git/hooks/pre-commit del tuo progetto
# 2. Rendilo eseguibile: chmod +x .git/hooks/pre-commit
# 3. Personalizza i pattern e le soglie in base al tuo progetto
#
# In alternativa, puoi configurarlo come hook Claude Code in .claude/settings.json
# (vedi sezione 2.9 del manuale).
#
# =============================================================================

set -euo pipefail

# Contatore errori — se > 0, il commit viene bloccato
ERRORI=0

# Colori per output leggibile (disabilitati se non in terminale)
if [ -t 1 ]; then
  ROSSO='\033[0;31m'
  GIALLO='\033[0;33m'
  VERDE='\033[0;32m'
  RESET='\033[0m'
else
  ROSSO=''
  GIALLO=''
  VERDE=''
  RESET=''
fi

# Lista dei file staged (solo aggiunti, copiati, modificati — non cancellati)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

# Se non ci sono file staged, esci subito
if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

# ---------------------------------------------------------------------------
# Check 1: Segreti nei file staged
# ---------------------------------------------------------------------------
# Cerca pattern comuni di segreti hardcoded.
# Personalizza i pattern in base alle convenzioni del tuo progetto.
echo "Controllo segreti nei file staged..."

SECRETS_PATTERN='API_KEY\s*=\s*["\x27][^"\x27]+|SECRET\s*=\s*["\x27][^"\x27]+|PASSWORD\s*=\s*["\x27][^"\x27]+|PRIVATE_KEY\s*=\s*["\x27][^"\x27]+|Bearer\s+[A-Za-z0-9\-._~+/]+=*|token\s*[:=]\s*["\x27][A-Za-z0-9\-._~+/]+["\x27]'

for file in $STAGED_FILES; do
  # Salta file binari e file di configurazione template/esempio
  if file "$file" | grep -q "binary" 2>/dev/null; then
    continue
  fi

  # Cerca pattern segreti nel contenuto staged (non nel working tree)
  if git show ":$file" 2>/dev/null | grep -EnI "$SECRETS_PATTERN" > /dev/null 2>&1; then
    echo -e "${ROSSO}ERRORE: Possibile segreto trovato in: $file${RESET}"
    echo "  Verifica il contenuto e usa variabili d'ambiente o .env.local"
    ERRORI=$((ERRORI + 1))
  fi
done

# ---------------------------------------------------------------------------
# Check 2: File .env staged
# ---------------------------------------------------------------------------
# I file .env contengono tipicamente segreti e non devono essere committati.
# Assicurati che .env sia nel .gitignore.
echo "Controllo file .env..."

for file in $STAGED_FILES; do
  if echo "$file" | grep -qE '(^|/)\.env(\..+)?$'; then
    # Permetti .env.example e .env.template — contengono placeholder, non segreti
    if echo "$file" | grep -qE '\.(example|template|sample)$'; then
      continue
    fi
    echo -e "${ROSSO}ERRORE: File .env staged: $file${RESET}"
    echo "  I file .env non devono essere committati. Aggiungili a .gitignore"
    ERRORI=$((ERRORI + 1))
  fi
done

# ---------------------------------------------------------------------------
# Check 3: File binari grandi (>5MB)
# ---------------------------------------------------------------------------
# File binari pesanti non appartengono al repository Git.
# Usa Git LFS per file binari necessari, o aggiungili a .gitignore.
echo "Controllo file binari grandi..."

MAX_SIZE_BYTES=$((5 * 1024 * 1024))  # 5 MB — personalizza la soglia

for file in $STAGED_FILES; do
  # Verifica che il file esista (potrebbe essere stato rinominato)
  if [ ! -f "$file" ]; then
    continue
  fi

  file_size=$(wc -c < "$file" 2>/dev/null || echo 0)
  if [ "$file_size" -gt "$MAX_SIZE_BYTES" ]; then
    size_mb=$(( file_size / 1024 / 1024 ))
    echo -e "${ROSSO}ERRORE: File troppo grande: $file (${size_mb}MB, max 5MB)${RESET}"
    echo "  Usa Git LFS per file binari grandi, o aggiungilo a .gitignore"
    ERRORI=$((ERRORI + 1))
  fi
done

# ---------------------------------------------------------------------------
# Check 4: CLAUDE.md non cancellato
# ---------------------------------------------------------------------------
# CLAUDE.md e' il file di configurazione per Claude Code.
# La sua cancellazione e' quasi sempre un errore.
echo "Controllo integrita' CLAUDE.md..."

DELETED_FILES=$(git diff --cached --name-only --diff-filter=D)
if echo "$DELETED_FILES" | grep -q "^CLAUDE\.md$"; then
  echo -e "${ROSSO}ERRORE: CLAUDE.md e' stato cancellato!${RESET}"
  echo "  Se intenzionale, usa: git commit --no-verify"
  ERRORI=$((ERRORI + 1))
fi

# ---------------------------------------------------------------------------
# Check 5: Warning se CLAUDE.md modificato (non bloccante)
# ---------------------------------------------------------------------------
# Le modifiche a CLAUDE.md influenzano il comportamento di Claude Code
# per tutto il team. Segnalalo come avviso.
if echo "$STAGED_FILES" | grep -q "^CLAUDE\.md$"; then
  echo -e "${GIALLO}AVVISO: CLAUDE.md e' stato modificato${RESET}"
  echo "  Le modifiche a CLAUDE.md influenzano il comportamento di Claude Code."
  echo "  Verifica che le modifiche siano intenzionali e condivise con il team."
fi

# ---------------------------------------------------------------------------
# Risultato finale
# ---------------------------------------------------------------------------
if [ "$ERRORI" -gt 0 ]; then
  echo ""
  echo -e "${ROSSO}Commit bloccato: $ERRORI problema/i trovato/i${RESET}"
  echo "Correggi gli errori sopra e riprova."
  echo "Per bypassare questo check (uso eccezionale): git commit --no-verify"
  exit 1
fi

echo -e "${VERDE}Tutti i check superati.${RESET}"
exit 0
