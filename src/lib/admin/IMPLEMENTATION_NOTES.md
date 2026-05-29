# Admin dashboard — note di implementazione (metriche derivate & filtri)

Documento di riferimento per la logica NON ovvia della dashboard admin v2.
Copre in particolare la **strategia di tier-filtering** (US-2, acceptance
criterion 3) e le metriche derivate correlate. Tutto il codice citato vive in
`src/lib/admin/`.

## 1. Tier dei lead — single source of truth

I lead sono classificati in tre fasce (`hot` / `warm` / `cold`) da
`computeLeadTier` in [`lead-scoring.ts`](./lead-scoring.ts). E' un modulo
**puro**: riceve i campi grezzi (`status`, `overall_score`, `email`,
`consenso_marketing`) e non tocca il DB. La stessa funzione e' riusata da
lista, dettaglio ed export, cosi' la regola e' definita in un solo punto.

Regole (soglie centralizzate in `TIER_THRESHOLDS`: `hotMin = 3.5`,
`warmMin = 2.5`):

- **HOT** = `status=completed` AND `overall_score >= 3.5` AND email presente AND
  `consenso_marketing = true`.
- **WARM** = `completed` con email e `overall_score` in `[2.5, 3.49]`,
  **oppure** tutti i requisiti HOT ma senza consenso marketing.
- **COLD** = `anonymous`, **oppure** `overall_score < 2.5`, **oppure** email
  assente.

Il campo `score` di `TierResult` non e' il punteggio del quiz: e' un **ranking**
(`hot=2000+overall`, `warm=1000+overall`, `cold=overall`) che ordina
hot→warm→cold con tie-break stabile su `overall_score` desc.

## 2. Perche' il tier non puo' essere filtrato puramente in SQL

Il tier **non e' una colonna del DB**: e' derivato. Filtrare/ordinare per tier
senza rompere la paginazione richiede attenzione, perche' due dei tre tier non
sono esprimibili come un singolo `AND` di predicati:

- **HOT** = intersezione di 4 condizioni → esprimibile **interamente** come
  `AND` di predicati SQL (status, overall>=3.5, email not null,
  consenso_marketing=true).
- **WARM** = **unione** di due insiemi (range medio di score *oppure* HOT-senza-
  consenso) → non e' un solo `AND`.
- **COLD** = **OR** di tre condizioni (anonymous / score basso / email assente)
  → non e' un solo `AND`.

`tierPredicates(tier)` in `lead-scoring.ts` ritorna quindi:

- per **HOT**, i 4 predicati AND completi (selezione esatta in SQL);
- per **WARM**, i soli predicati "core" di restringimento (completed, email not
  null, overall>=2.5): un **superset** del set WARM reale;
- per **COLD**, **nessun** predicato (`[]`): il restringimento netto non e'
  possibile senza `OR`.

## 3. Strategia adottata: restringimento SQL + raffinamento in memoria

Implementata in `applyFilters` e `fetchSubmissions` in
[`queries.ts`](./queries.ts):

1. **Restringimento SQL** — `applyFilters` traduce `tierPredicates(f.tier)` in
   chiamate alla query builder Supabase (`eq` / `gte` / `not...is null`). Per
   HOT questo basta gia' a selezionare le righe giuste.
2. **Raffinamento in memoria** — quando `f.tier` e' presente (`needsMemoryRefine`)
   si carica il set ristretto (cap `MAX_STATS_ROWS`) e si filtra con
   `computeLeadTier(r).tier === f.tier`. Questo elimina i falsi positivi del
   superset WARM e seleziona correttamente i COLD (per cui SQL non aveva
   ristretto nulla).
3. **Paginazione coerente** — poiche' il set reale di un tier si conosce solo
   dopo il raffinamento, in questo percorso `count` e paginazione sono calcolati
   **in JS** sul set classificato (`rows.slice(from, from+pageSize)`,
   `total = rows.length`). Cosi' il totale mostrato e le pagine restano coerenti
   con i filtri applicati. Il percorso "standard" (nessun tier, sort su colonna
   DB) usa invece `count: "exact"` e `range()` lato DB.

Lo stesso raffinamento in memoria e' replicato in `fetchExportRows`, cosi'
l'**export CSV eredita i filtri** (incluso il tier) in modo identico alla lista.

## 4. Preset "Segmenti commerciali" — tier vs status

I preset in [`../../components/admin/FilterBar.tsx`](../../components/admin/FilterBar.tsx)
usano **due strategie di filtro diverse di proposito**:

- **Hot leads / Warm / Quick win** → parametro `tier` (metrica derivata, vedi
  sopra).
- **Da ricontattare** → parametro `status=anonymous` (colonna DB diretta).
  Sono i record che non hanno inviato il form. Usare `tier=cold` qui sarebbe
  **piu' ampio** (cold include anche completati con maturita' bassa o senza
  email): per il segmento "da ricontattare" vogliamo esattamente i soli anonimi.

`reset()` azzera tutti i filtri **incluso il tier** (riporta a `/admin` senza
querystring).

## 5. Ordinamenti sintetici (whitelist)

Oltre alle colonne DB ordinabili (`SORTABLE_COLUMNS` in
[`types.ts`](./types.ts)), esistono chiavi di ordinamento **sintetiche** in
`SYNTHETIC_SORT_KEYS`, validate dalla stessa whitelist `isSortable()` (no
SQL injection sul nome colonna):

- **`tier`** — ordina per il ranking di `computeLeadTier` (hot>warm>cold).
- **`gap`** — ordina per il gap totale di vendita (`computeGapTotale`: somma su
  6 assi di `target - punteggio`). I record senza punteggi (`gap = null`)
  finiscono sempre in coda, qualsiasi sia la direzione.

Entrambi ordinano **in memoria** sul set filtrato (vedi `sortSynthetic` in
`queries.ts`, condivisa fra percorso reale e mock), perche' non sono colonne
DB. Quando `f.sort` e' sintetico si segue lo stesso percorso JS-paginato del
tier-filtering, per coerenza di `count`/pagine.

## 6. Modalita' mock (sandbox)

Con `ADMIN_MOCK=1` (`isMockMode()` in [`mock-data.ts`](./mock-data.ts)) tutte le
query leggono dataset finti invece di Supabase. `mockMatches` e `sortMockRows`
replicano fedelmente filtri e ordinamenti (incluso tier-filtering e ordinamenti
sintetici) cosi' la dashboard e' verificabile in ambienti senza accesso al DB.
La verifica con dati reali resta a carico del deploy.
