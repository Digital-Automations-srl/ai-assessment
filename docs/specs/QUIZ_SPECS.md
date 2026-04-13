# Quiz AI Readiness - Specifiche Complete per Implementazione

**Versione**: 1.0 | **Data**: 13 aprile 2026 | **Progetto**: Digital Automations - AI Starter Program

---

## BRIEF

Realizzare un quiz di autovalutazione AI Readiness come **singolo file HTML standalone** (`quiz.html`). Il quiz misura la maturita' AI di una PMI italiana su 6 assi, produce un grafico a ragno SVG con punteggi calcolati e una checklist compliance su 7 aree obbligatorie.

### Vincoli tecnici
- Singolo file HTML (HTML + CSS + JS inline)
- Zero dipendenze esterne (no CDN, no framework, no build step)
- Zero backend (tutto lato client)
- Zero localStorage/sessionStorage (dati in memoria JS)
- Responsive mobile-first, breakpoint 768px
- Touch-friendly: area cliccabile minima 44x44px

### File di riferimento
- `AI_Readiness_Ragno.jsx`: componente React esistente per il grafico a ragno. **NON usare React**: portare la logica SVG a vanilla JS. Contiene funzioni `polarToCartesian`, `buildPolygonPoints`, costanti colori/assi/livelli da riutilizzare.

### Priorita' implementative
1. Quiz funzionante con tutte le domande e scoring corretto
2. Ragno SVG generato dai punteggi reali
3. Checklist compliance con semaforo
4. Design responsive e curato
5. Animazioni e transizioni (nice to have)

---

## PALETTE DA

| Token | Hex | Uso |
|-------|-----|-----|
| Navy | #004172 | Testi principali, header, titoli |
| Blue | #016FC0 | CTA, link, accenti, profilo risultato |
| Light Gray | #E4E4E4 | Bordi, sfondi secondari |
| White | #FFFFFF | Sfondo principale |
| Amber | #E09900 | Alert, evidenziazioni, warning |

Colori aggiuntivi per semafori compliance:
- Rosso: #dc2626
- Verde: #16a34a

---

## STRUTTURA FUNNEL (10 step)

### Step 1: Landing
- Titolo: "Quanto e' pronta la tua azienda per l'AI?"
  - 28px mobile / 36px desktop, font-weight 800, color Navy, text-align center
- Sottotitolo: "30 domande, 8 minuti. Scopri il tuo livello su 6 aree chiave e verifica la conformita' su 7 obblighi normativi."
  - 16px mobile / 18px desktop, color #666
- CTA: "Inizia il quiz gratuito"
  - Background Blue, color white, border-radius 8px, padding 16px 40px, font-size 18px, font-weight 700
  - Hover: background Navy
- Sotto CTA: 3 badge ("Gratuito", "8 minuti", "Risultato immediato") in flex row, font-size 13px, color #999

### Step 2: Istruzioni pre-quiz
Box con background #f8f9fa, border 1px solid #E4E4E4, border-radius 10px, padding 20px:

> **Prima di iniziare**
>
> Questo quiz misura lo stato REALE della vostra azienda sull'intelligenza artificiale. Non e' un test: non ci sono risposte giuste o sbagliate.
>
> Per ottenere un risultato utile:
> - Rispondete in base a quello che e' realmente implementato e documentato oggi, non a quello che pianificate.
> - Se non siete sicuri di una risposta, scegliete l'opzione piu' conservativa.
> - Alcune domande riguardano aspetti tecnici: se non avete visibilita' diretta, troverete un'opzione "non sono sicuro" pensata per voi.
>
> Tempo stimato: 8-10 minuti.

CTA: "Ho capito, iniziamo" (padding 12px 32px)

### Step 3: Domande contesto (X1-X3)
3 domande non scorabili, senza progress bar. Una per pagina.

### Step 4: Quiz (30 domande scorabili)
6 assi x 5 domande. Una domanda per pagina.

**Progress bar per asse** (NON per domanda singola):
- Testo sopra: "Asse 1 di 6: Conformita'" (Navy, font-weight 600, 13px)
- Barra: width 100%, background #E4E4E4, height 6px, border-radius 4px; fill Blue, transition 0.3s
- Testo sotto: "Domanda 2 di 5" (#999, 12px)

**Card domanda**:
- Testo: 18px mobile / 20px desktop, font-weight 600, Navy

**Opzioni** (radio, singola selezione):
- Blocco cliccabile: border 2px solid #E4E4E4, border-radius 10px, padding 16px 20px, margin-bottom 10px, min-height 44px
- Hover: border-color Blue, background Blue/08
- Selected: border-color Blue, background Blue/05, box-shadow 0 0 0 1px Blue
- Lettera (A, B, C...): cerchio 28px, background #E4E4E4, color #666, font-weight 700; selected: background Blue, color white
- Opzione "Non so" (solo D3, D4, T1, T3): lettera "?", testo in corsivo, background #FFF8E7, border 2px solid Amber/40

**Navigazione**:
- "Indietro": border 2px solid #E4E4E4, color #666
- "Avanti": stile CTA Blue; **disabilitato** se nessuna opzione selezionata (opacity 0.4, cursor not-allowed)

### Step 5: Transizione tra assi
Schermata intermedia (click per continuare):
- Check icon verde, "Conformita' completato!", sotto: "Prossimo: Processi e Controlli (Asse 2 di 6)"
- Fade-in 0.3s

### Step 6: Risultato gratuito (ragno)
Visibile SENZA form. Contiene:
- Titolo: "Il tuo profilo AI Readiness" (24px, weight 800, Navy, center)
- Badge punteggio: numero grande (48px, weight 800), colore basato su livello, etichetta sotto
- Ragno SVG (specifiche sotto)
- Tabella punteggi per asse (6 righe: nome | score | etichetta | barra visuale)
- Messaggio contestuale (box con border-left 4px Blue, background #f0f7ff)
- CTA: "Vuoi il report completo?" -> "Ottieni il report gratuito"

### Step 7: Form lead capture
Campi:
- Nome (obbligatorio) + Cognome (obbligatorio): 2 colonne desktop, 1 mobile
- Email aziendale (obbligatorio): full width
- Azienda (obbligatorio): full width
- Telefono (facoltativo): full width
- Consenso GDPR (obbligatorio): checkbox + testo "Acconsento al trattamento dei miei dati personali da parte di Digital Automations per l'invio del report e per finalita' di marketing diretto. Potro' revocare il consenso in qualsiasi momento."

Input style: padding 12px 16px, border 2px solid #E4E4E4, border-radius 8px, focus border-color Blue

CTA: "Invia e ricevi il report" (full width, disabilitato se incompleto)
**Nel mockup**: il form NON invia dati; al submit mostra il report direttamente.

### Step 8: Report dettagliato
(Vedi sezione REPORT sotto)

### Step 9: Thank you
- Check icon verde grande
- "Grazie, [Nome]!" (28px, weight 800, Navy)
- "Il tuo report e' stato inviato a [email]." (16px, #666)
- CTA: "Prenota una call con un consulente DA"
- Link: "Torna al tuo profilo"

### Step 10: Header fisso
Su tutte le pagine:
- "Digital Automations" (Navy, weight 700, 14px) + "AI Readiness Assessment" (Blue, 12px)
- Border-bottom 1px #E4E4E4, padding 12px 24px, sticky top 0, background white, z-index 100

---

## LOGICA SCORING

### Per asse
`score_asse = somma(5 risposte) / 5` → Range 1.0 - 5.0

Nota: domande con "Non so" (D3, D4, T1, T3) assegnano **score 1.5**.

### Complessivo
`score_totale = somma(6 assi) / 6` → Range 1.0 - 5.0

### Etichette livello

| Range | Etichetta | Colore badge |
|-------|-----------|-------------|
| 1.0 - 1.4 | Iniziale | #dc2626 (rosso) |
| 1.5 - 2.4 | In avvio | #E09900 (amber) |
| 2.5 - 3.4 | In costruzione | #ca8a04 (giallo scuro) |
| 3.5 - 4.4 | Operativo | #16a34a (verde) |
| 4.5 - 5.0 | Maturo | #047857 (verde scuro) |

### Messaggi contestuali

**1.0-1.4**: "La tua azienda e' nella fase iniziale del percorso AI. Non hai ancora strutture, processi o tecnologia dedicata. E' la condizione della maggior parte delle PMI italiane: il momento giusto per partire con un approccio strutturato e' adesso."

**1.5-2.4**: "La tua azienda ha mosso i primi passi, ma senza una struttura organica. Ci sono iniziative isolate che rischiano di restare frammentate. Un programma strutturato puo' trasformare queste iniziative in un sistema governato."

**2.5-3.4**: "La tua azienda sta costruendo una base solida. Hai gia' fatto scelte importanti, ma servono consolidamento e integrazione per passare dalla sperimentazione all'operativita'."

**3.5-4.4**: "La tua azienda ha un buon livello di maturita' AI. Le strutture ci sono; ora servono ottimizzazione, integrazione avanzata e consolidamento della governance."

**4.5-5.0**: "La tua azienda e' tra le piu' avanzate nel panorama PMI italiano. Continua a investire in revisione periodica e innovazione."

---

## CHECKLIST 7 AREE COMPLIANCE

### Logica semaforo

| Colore | Condizione | Design |
|--------|------------|--------|
| Rosso (#dc2626) | Score < 2.0 | background #fef2f2, border-left 4px solid #dc2626 |
| Giallo (#E09900) | Score 2.0-3.0 | background #fffbeb, border-left 4px solid #E09900 |
| Verde (#16a34a) | Score > 3.0 | background #f0fdf4, border-left 4px solid #16a34a |

### Mappatura e testi

**Area 1: Registro Strumenti AI** | Rif: AI Act Art. 6, GDPR Art. 6 | Score = C2
- Rosso: "Non avete un registro degli strumenti AI in uso. E' il primo passo per la conformita'."
- Giallo: "Avete iniziato a catalogare gli strumenti, ma il registro e' incompleto o non include la classificazione del rischio."
- Verde: "Registro presente e aggiornato. Verificate che includa la classificazione rischio per ogni strumento."
- Azione: "Compilate un registro di tutti gli strumenti AI in uso con: nome, reparto, dati trattati, livello di rischio."

**Area 2: Registro Casi d'Uso e screening rischio** | Rif: AI Act Art. 5-6, Art. 26(2) | Score = media(C5, A4)
- Rosso: "Non documentate i casi d'uso AI ne' verificate se rientrano in pratiche ad alto rischio o vietate."
- Giallo: "Alcuni casi d'uso sono documentati, ma manca una verifica sistematica del livello di rischio."
- Verde: "Casi d'uso documentati con classificazione rischio. Screening pratiche vietate completato."
- Azione: "Documentate ogni caso d'uso AI con: finalita', dati coinvolti, livello di rischio, supervisore umano."

**Area 3: AI Policy interna** | Rif: AI Act Art. 17, 26 | Score = media(G1, G2)
- Rosso: "Non avete una policy scritta sull'uso dell'AI. I dipendenti non hanno regole chiare."
- Giallo: "Avete una policy, ma non e' firmata da tutti o non viene monitorata l'aderenza."
- Verde: "Policy scritta, distribuita, firmata e monitorata. Processo di approvazione nuovi strumenti attivo."
- Azione: "Scrivete una AI Acceptable Use Policy e fatela firmare a tutti i dipendenti coinvolti."

**Area 4: Informative trasparenza** | Rif: L. 132/2025, AI Act Art. 50, GDPR Art. 13-14 | Score = C3
- Rosso: "Non informate dipendenti, clienti o fornitori che i loro dati vengono trattati con AI."
- Giallo: "Le informative privacy esistono ma non sono specifiche per i trattamenti AI."
- Verde: "Informative specifiche per l'AI aggiornate per tutti i soggetti coinvolti."
- Azione: "Aggiornate le informative privacy per includere specificamente i trattamenti effettuati con AI."

**Area 5: Formazione e alfabetizzazione AI** | Rif: AI Act Art. 4, L. 132/2025 Art. 24 | Score = media(C4, S1)
- Rosso: "Nessuna formazione AI erogata. Il team non conosce rischi e obblighi."
- Giallo: "Formazione avviata ma parziale: non copre ancora tutto il personale coinvolto."
- Verde: "Formazione strutturata erogata. Il team conosce rischi, obblighi e utilizzo corretto."
- Azione: "Organizzate formazione su rischi AI, obblighi normativi e utilizzo corretto per tutto il personale coinvolto."

**Area 6: Valutazione d'impatto (DPIA)** | Rif: GDPR Art. 35 | Score = C5
- Rosso: "Non fate valutazioni d'impatto per i trattamenti AI che coinvolgono dati personali."
- Giallo: "Avete fatto qualche valutazione, ma non per tutti i trattamenti ad alto rischio."
- Verde: "DPIA completate per tutti i trattamenti AI ad alto rischio. Procedura formalizzata."
- Azione: "Completate una valutazione d'impatto scritta per ogni trattamento AI che coinvolge dati personali su larga scala."

**Area 7: Monitoraggio e governance continua** | Rif: Best practice, AI Act Art. 113 | Score = media(G5, T4)
- Rosso: "Non monitorate l'uso dell'AI ne' avete processi per gestire problemi."
- Giallo: "Monitoraggio basico presente ma senza processi formali per incidenti."
- Verde: "Monitoraggio attivo con processo di gestione incidenti e revisione periodica."
- Azione: "Attivate un monitoraggio regolare dell'uso AI e definite un processo per gestire violazioni e incidenti."

---

## RAGNO SVG: SPECIFICHE

Dimensioni viewport: 420x420. Width 100% responsive.

Geometria (portare da `AI_Readiness_Ragno.jsx`):
- Centro: (210, 210)
- Raggio: 420 * 0.36 = ~151px
- 6 assi equidistanti, partendo da ore 12 (top) in senso orario
- 5 livelli di griglia (pentagoni concentrici)

Stili:
- Griglia: stroke #E4E4E4, strokeWidth 0.7 (ultima 1.5)
- Assi: stroke #E4E4E4, strokeWidth 0.7
- Poligono risultato: fill Blue opacity 0.15, stroke Blue strokeWidth 2.2, strokeLinejoin round
- Punti vertice: cerchi r=4, fill Blue, stroke white strokeWidth 1.5
- Label assi: font-size 13px, font-weight 600, color Navy
- Numeri livelli: font-size 10px, fill #999

Ordine assi (da ore 12, senso orario):

| # | Key | Label | Formal |
|---|-----|-------|--------|
| 1 | conformita | Conformita' | Compliance |
| 2 | processi | Processi e Controlli | Governance |
| 3 | utilizzo | Utilizzo Reale | Adoption |
| 4 | autonomia | Autonomia Team | AI Skills |
| 5 | protezione | Protezione Dati | Data Security |
| 6 | tecnologia | Tecnologia | Technology |

Legenda sotto il ragno: box #f8f9fa con mappatura italiano -> inglese.

---

## REPORT DETTAGLIATO (post-form)

### Sezione 1: Profilo
Ragno SVG + badge punteggio + messaggio contestuale (come Step 6)

### Sezione 2: Dettaglio per asse
6 card espandibili. Per ciascuna:
- Header: nome asse + punteggio + etichetta + freccia expand
- Espanso:
  - "Il tuo livello: [etichetta] ([score]/5.0)"
  - "Cosa significa": descrizione dal LEVEL_DETAILS (vedi JSX)
  - "In 90 giorni puoi raggiungere": livello target (vedi tabella AFTER sotto)

Profili AFTER (target post-programma 90gg):

| Asse | After | Etichetta after |
|------|-------|-----------------|
| Conformita' | 3.5 | In costruzione |
| Processi e Controlli | 4.0 | Applicata |
| Utilizzo Reale | 3.0 | Strutturata |
| Autonomia Team | 3.5 | Formazione |
| Protezione Dati | 4.0 | Protetta |
| Tecnologia | 4.0 | Integrata |

### Sezione 3: Checklist compliance
Titolo: "Conformita': le 7 aree obbligatorie"
Sottotitolo: "Verifica basata sulle tue risposte. Norme di riferimento: AI Act (Reg. UE 2024/1689), GDPR, Legge 132/2025."
7 righe con semaforo + nome + rif. normativo + score + descrizione + azione.

### Sezione 4: Prossimi passi
Box #f0f7ff:
- "L'AI Starter Program di Digital Automations porta la tua azienda da dove sei oggi a un livello 3.5-4.0 su tutti gli assi in 90 giorni. Piattaforma AI privata, governance completa, team formato e autonomo."
- CTA: "Prenota una call di 30 minuti"
- Link: "Scopri l'AI Starter Program"

---

## TUTTE LE DOMANDE

### Contesto (non scorabili)

**X1** | "Qual e' il settore principale della vostra azienda?"
Opzioni: Manifattura e produzione | Distribuzione e retail | Servizi professionali | Costruzioni e impianti | Logistica e trasporti | Formazione e education | IT e tecnologia | Altro

**X2** | "Quanti dipendenti ha la vostra azienda?"
Opzioni: Meno di 10 | 10-50 | 51-100 | 101-250 | Piu' di 250

**X3** | "Qual e' il suo ruolo in azienda?"
Opzioni: Titolare / CEO | Direzione generale (AD, DG) | IT / CTO | HR / Risorse Umane | Amministrazione e finanza | Altro

---

### ASSE 1: CONFORMITA' (key: conformita)

**C1** | "In azienda, chi conosce l'esistenza delle nuove norme sull'intelligenza artificiale e i relativi obblighi?"
A (1): Nessuno. Non sappiamo che esistano obblighi normativi legati all'AI.
B (2): Il CEO/direzione ne hanno sentito parlare, ma non e' una priorita' e non abbiamo fatto nulla di concreto.
C (3): Abbiamo nominato una persona responsabile che sta raccogliendo informazioni e ha iniziato a lavorarci.
D (4): Responsabile dedicato attivo; abbiamo un piano concreto in esecuzione con documentazione in corso.
E (5): Responsabile dedicato, piano consolidato, revisioni periodiche programmate.

**C2** | "Fate un elenco degli strumenti o software con intelligenza artificiale usati in azienda?"
A (1): No, nessun elenco. Ogni reparto usa quello che vuole senza coordinamento.
B (2): Non formalizzato, ma il management sa vagamente quali sistemi usiamo.
C (3): Abbiamo iniziato a fare un elenco, ma e' incompleto o non aggiornato.
D (4): Elenco completo e aggiornato: per ogni strumento documentiamo chi lo usa, per quale attivita', con quale livello di rischio (basso/medio/alto). Abbiamo verificato che nessun uso rientri in pratiche vietate (decisioni automatizzate su persone senza controllo umano, sorveglianza sistematica dei dipendenti).
E (5): Registro aggiornato con procedura obbligatoria prima di adottare ogni nuovo strumento. Revisione almeno semestrale che include screening pratiche vietate e riclassificazione del rischio.

**C3** | "Quando usate intelligenza artificiale con dati di dipendenti, clienti o fornitori, li informate esplicitamente che i loro dati vengono trattati con AI e quali sono le implicazioni?"
A (1): No, non lo comunichiamo. Non ci abbiamo pensato.
B (2): Accennato nel contratto generico o nella privacy policy, ma non in modo specifico per l'AI.
C (3): Stiamo scrivendo documenti specifici; alcuni gia' aggiornati per i trattamenti principali.
D (4): Documenti specifici aggiornati per tutti i trattamenti principali; informative chiare per dipendenti, clienti, fornitori.
E (5): Informative complete, revisionate periodicamente, con linguaggio comprensibile e verifiche di conformita'.

**C4** | "Il personale che usa strumenti AI ha ricevuto formazione su rischi, utilizzo corretto e conseguenze legali dell'uso scorretto?"
A (1): No, nessuna formazione specifica su questo tema.
B (2): Qualcuno si e' informato per conto suo (corsi online, articoli), ma niente di organizzato dall'azienda.
C (3): Formazione avviata o in preparazione; copertura parziale (meno del 50% del personale coinvolto).
D (4): Formazione strutturata erogata; oltre il 50% del personale gia' formato; piano per completare il resto.
E (5): 100% del personale interessato formato; percorso ripetuto ogni anno; verifica di comprensione documentata.

**C5** | "Quando adottate un nuovo strumento AI che tratta dati personali o prende decisioni che impattano su persone, fate una valutazione d'impatto scritta sui rischi per l'azienda, i dipendenti e i clienti?"
A (1): No, lo scegliamo se ci piace e basta.
B (2): Ci pensiamo, ma non c'e' un processo formale ne' una documentazione scritta.
C (3): Abbiamo fatto almeno una valutazione d'impatto scritta per i trattamenti AI che coinvolgono dati personali.
D (4): Valutazione d'impatto completata per tutti i trattamenti AI ad alto rischio o su larga scala; documentazione archiviata e consultabile; procedura obbligatoria prima di ogni nuova adozione.
E (5): Valutazioni riviste periodicamente; audit interno almeno semestrale; tracciamento decisioni con evidenze documentate.

---

### ASSE 2: PROCESSI E CONTROLLI (key: processi)

**G1** | "Come sono definite le regole per l'uso dell'intelligenza artificiale nella vostra azienda?"
A (1): Non abbiamo regole. Ogni persona usa gli strumenti AI come crede.
B (2): Diamo indicazioni a voce ("non caricate dati di clienti su ChatGPT"), ma niente di scritto.
C (3): Abbiamo una policy d'uso AI scritta e distribuita. Almeno il 50% dei destinatari la conosce e sa citare le regole principali.
D (4): La policy e' firmata da tutti i dipendenti interessati. Abbiamo verificato l'aderenza almeno una volta (audit, survey, o colloqui). L'abbiamo aggiornata almeno una volta.
E (5): Le regole sull'AI sono integrate nei processi normali (onboarding, manuale dipendente, procedure operative). Riviste ogni anno con evidenza documentata.

**G2** | "Quando la vostra azienda valuta l'adozione di un nuovo strumento AI, chi lo approva e con quale procedura?"
A (1): Non c'e' un processo. Se serve a qualcuno, lo usiamo.
B (2): A volte lo si chiede al responsabile; a volte si fa direttamente. Niente di strutturato.
C (2.5): Abbiamo una checklist informale (dati sensibili? privacy? licenze?) ma non e' ancora una procedura scritta.
D (4): Procedura scritta: chi vuole usare un nuovo strumento AI compila una richiesta. Un responsabile lo approva verificando dati, sicurezza, conformita'. Lo classifichiamo come "via libera", "con condizioni" o "vietato".
E (5): La procedura e' integrata nel processo di acquisti e change management. Tutti i nuovi strumenti (AI e non) seguono lo stesso percorso. Verifica ogni 6 mesi.

**G3** | "Chi e' responsabile della governance e della sicurezza dell'AI nella vostra azienda?"
A (1): Nessuno in particolare. Non abbiamo assegnato questa responsabilita'.
B (2): Ne parla il CEO o il direttore, ma non e' un ruolo formalizzato. Se ne occupa "quando serve".
C (3): Abbiamo identificato un responsabile (o un piccolo gruppo) con compiti definiti per iscritto. Ha completato almeno un'azione concreta (es. ha approvato o bloccato uno strumento, ha prodotto un documento).
D (4): Un responsabile AI (o comitato) e' operativo: ha approvato gli ultimi nuovi strumenti, supervisiona l'uso, comunica rischi al management.
E (5): La governance AI e' affidata a un referente/comitato con meeting regolari, metriche tracciate e coinvolgimento di management, IT, compliance. Revisione annuale dei rischi.

**G4** | "Distinguete i diversi usi dell'AI in base al rischio? (es. usare AI per scrivere email vs usarla per decisioni su dipendenti o clienti)"
A (1): No, usiamo gli stessi strumenti per tutto senza distinzione.
B (2): Sappiamo che certi usi sono piu' rischiosi, ma non abbiamo una classificazione scritta.
C (3): Abbiamo una classificazione scritta (basso, medio, alto rischio) e la usiamo quando approviamo nuovi strumenti, ma non per tutte le attivita' gia' in corso.
D (4): Usiamo un sistema formale per qualificare ogni attivita' AI: quali dati tratta, che impatto ha, e' conforme? Lo applichiamo sia ai nuovi strumenti sia a quelli esistenti.
E (5): La classificazione del rischio e' integrata nei processi aziendali standard. La aggiorniamo quando emergono nuovi rischi. Tracciamo metriche (quanti usi a rischio alto, medio, basso).

**G5** | "Come monitorate l'uso reale dell'AI in azienda? Avete un processo per gestire problemi o violazioni delle regole?"
A (1): Non monitoriamo. Se scopriamo un problema, lo affrontiamo sul momento.
B (2): Il management e' consapevole e ogni tanto chiede feedback, ma non c'e' un sistema strutturato.
C (3): Abbiamo un registro base degli strumenti e di chi li usa. Rivediamo la policy almeno una volta l'anno. Non c'e' un processo formale per gestire gli incidenti.
D (4): Monitoriamo l'uso (quali strumenti, chi accede, anomalie). Abbiamo un processo per segnalare e investigare i problemi. Rivediamo la policy ogni 6-12 mesi.
E (5): Monitoraggio sistematico (log, dashboard). Incidenti gestiti con processo formale (segnalazione, investigazione, correzione documentata). Policy rivista annualmente con input da tutte le funzioni. Metriche reportate al management.

---

### ASSE 3: UTILIZZO REALE (key: utilizzo)

**A1** | "Quanti dipendenti della vostra azienda usano strumenti AI nel lavoro, anche occasionalmente?"
A (1): Nessuno, o solo 1-2 persone che lo fanno per conto proprio.
B (2): Circa il 5-15% dei dipendenti, per iniziativa personale senza coordinamento.
C (3): Circa il 15-30%, con qualche coordinamento: sanno cosa usare e per cosa.
D (4): Il 30-60% dei dipendenti usa l'AI regolarmente in piu' reparti.
E (5): Oltre il 60%, come parte del lavoro quotidiano.

**A2** | "Come viene usata l'AI nella vostra azienda?"
A (1): Ogni persona fa da se', nessun coordinamento. Ognuno usa strumenti diversi.
B (2): Pochi usano lo stesso strumento, ma senza processi definiti. Molti sperimentano in modo casuale.
C (3): Un team o un reparto usa l'AI in modo coordinato per attivita' specifiche e definite.
D (4): 2-3 reparti hanno processi AI definiti e documentati, con guide interne.
E (5): L'AI e' integrata nei flussi standard. Tutti i reparti principali hanno processi codificati.

**A3** | "Avete agenti AI o automazioni configurate per attivita' specifiche (es. rispondere a domande frequenti, estrarre dati da documenti, assistere il commerciale)?"
A (1): Nessuno. Usiamo solo chatbot generici senza configurazione.
B (2): 1 agente o automazione informale (es. un bot di prova), non usato regolarmente.
C (3): 1-3 agenti configurati per attivita' specifiche e usati regolarmente dal team.
D (4): 4-6 agenti attivi in almeno 2 reparti diversi, con risultati documentati.
E (5): 7 o piu' agenti integrati in processi critici su 3 o piu' reparti.

**A4** | "Come documentate i vostri casi d'uso AI? (quali attivita' fate con l'AI, come, con quali risultati)"
A (1): Non documentati. Ogni persona sa cosa fa, ma non c'e' una mappa condivisa.
B (2): Documentazione informale (note, email, chat). Difficile replicare o condividere.
C (3): 2-3 processi documentati con istruzioni condivise e un referente per ciascuno.
D (4): 4-6 processi documentati con checklist, ruoli chiari e aggiornamento regolare.
E (5): Tutti i processi AI mappati, versionati, con formazione periodica. Cultura della condivisione.

**A5** | "Misurate l'impatto dell'AI sulle vostre attivita'? (tempo risparmiato, errori ridotti, costi, soddisfazione)"
A (1): Non misuriamo nulla. Abbiamo un'impressione generica ("funziona bene") ma nessun dato.
B (2): Feedback verbali e impressioni. Nessun dato strutturato.
C (3): 1-2 indicatori tracciati per i processi principali (es. tempo di risposta, volume gestito).
D (4): KPI specifici per agente/processo. ROI stimato per almeno 1 area. Monitoraggio regolare.
E (5): Dashboard con metriche di impatto in tempo reale. ROI tracciato per ogni agente. Analisi periodica con la direzione.

---

### ASSE 4: AUTONOMIA TEAM (key: autonomia)

**S1** | "Nel vostro team, quanta esperienza pratica c'e' con strumenti di intelligenza artificiale?"
A (1): Nessuna. Qualcuno ha provato ChatGPT per curiosita' personale, ma non fa parte del lavoro.
B (2): Alcuni colleghi hanno seguito corsi online per conto proprio. Usano l'AI saltuariamente, senza un metodo condiviso.
C (3): Abbiamo organizzato formazione interna strutturata. La maggior parte del team sa usare almeno uno strumento AI e ne conosce i limiti.
D (4): Il team usa regolarmente strumenti AI. Abbiamo 2-3 "esperti interni" che supportano i colleghi e creano guide su come usarli correttamente.
E (5): L'AI e' integrata nel lavoro quotidiano. Gli esperti interni formano i nuovi colleghi, il team propone autonomamente nuovi casi d'uso.

**S2** | "La direzione della vostra azienda sa: quali dati non si possono usare con l'AI? Come valutare il rischio di un nuovo strumento? Quali sono gli obblighi normativi?"
A (1): No. Per noi "AI" significa soprattutto automazione e produttivita'. Non pensiamo a rischi normativi.
B (2): Idea vaga che "dati personali e AI" sono collegati, ma nessun processo formale per valutare uno strumento.
C (3): Il management ha ricevuto formazione base su governance AI: conosce i rischi, gli obblighi, ed e' in grado di citare almeno 2 rischi concreti legati all'uso dell'AI in azienda.
D (4): Management valuta autonomamente nuovi strumenti rispetto a conformita', privacy, impatto. Processo documentato con referente che verifica.
E (5): Management integra l'AI nelle scelte strategiche con piena consapevolezza. Triage strutturato per ogni nuovo strumento, formazione aggiornata annualmente.

**S3** | "Nel vostro team, c'e' almeno una persona che sa creare contenuti efficaci con l'AI, configurare uno strumento, e potrebbe insegnarlo a un collega?"
A (1): No, nessuno ha queste competenze. Quando serve, chiediamo a fornitori esterni.
B (2): 1-2 persone hanno queste capacita', ma in modo autodidatta. Non sono riconosciute come referenti.
C (3): Abbiamo identificato 2-3 referenti interni ("campioni AI"). Hanno ricevuto formazione strutturata e sanno usare la piattaforma e configurare strumenti base.
D (4): I nostri campioni AI operano in autonomia: configurano strumenti avanzati, supportano il team senza bisogno di assistenza esterna costante.
E (5): Abbiamo una rete interna di campioni AI che si formano a vicenda. Almeno uno puo' formare nuovi colleghi. Esiste un canale formale per dubbi tecnici e normativi.

**S4** | "Quanto il vostro team e' in grado di usare strumenti AI senza assistenza esterna per le attivita' quotidiane?"
A (1): Per niente. Ogni volta abbiamo bisogno di supporto esterno o di IT.
B (2): Parzialmente. Il team prova, ma spesso deve chiedere aiuto quando qualcosa non funziona o il risultato non sembra affidabile.
C (3): Si', il team usa gli strumenti in autonomia per la maggior parte dei compiti. Chiediamo supporto solo per situazioni particolari.
D (4): Completamente autonomo. Il team sa usare gli strumenti, risolvere problemi comuni, e sa quando chiedere aiuto (es. rischio normativo, dato sensibile).
E (5): Autonomo e proattivo: propone nuovi casi d'uso, valuta in autonomia se uno strumento e' affidabile, identifica rischi prima di usarlo.

**S5** | "Quando scoprite un nuovo strumento AI, la vostra organizzazione e' in grado di valutare se e' utile e sicuro, autorizzarlo, e formare i colleghi?"
A (1): No. Qualcuno lo prova per conto suo, il management non sa se e' stato valutato o autorizzato.
B (2): Cerchiamo una valutazione (da IT o un consulente), ma non c'e' un processo strutturato. La formazione e' informale.
C (3): Abbiamo un processo: quando emerge un nuovo strumento, chiediamo una valutazione. Se approvato, facciamo una breve formazione.
D (4): Processo formale e documentato. I referenti AI sanno valutare utilita' e conformita'. La formazione e' strutturata. Aggiornamenti ogni 3-6 mesi.
E (5): Valutazione autonoma e rapida. I campioni AI formano i colleghi. Cultura di apprendimento continuo: il team propone casi d'uso, le esperienze vengono documentate e condivise.

---

### ASSE 5: PROTEZIONE DATI (key: protezione)

**D1** | "Come accedono i vostri dipendenti agli strumenti di intelligenza artificiale?"
A (1): Usano strumenti gratuiti o personali (ChatGPT free, Gemini free, ecc.) con dati aziendali, senza controllo.
B (2): Abbiamo vietato gli strumenti AI pubblici, ma non offriamo un'alternativa. Chi ne ha bisogno chiede eccezioni caso per caso.
C (3): Abbiamo una piattaforma AI aziendale con accessi gestiti. I dipendenti la usano come alternativa, ma alcuni usano ancora strumenti esterni.
D (4): Piattaforma AI aziendale con autenticazione e controllo accessi per ruolo. I dati non escono dal perimetro aziendale. Gli strumenti non autorizzati sono bloccati o monitorati.
E (5): Come l'opzione D, con audit periodico dei log di accesso e procedura di risposta in caso di violazioni.

**D2** | "Avete definito quali dati aziendali possono essere usati con strumenti AI e quali no?"
A (1): No, i dipendenti decidono autonomamente cosa condividere con gli strumenti AI.
B (2): Sappiamo che alcuni dati non dovrebbero andare su ChatGPT (password, dati bancari), ma non abbiamo una lista formale. La regola e' "usa il buonsenso".
C (3): Abbiamo un documento che classifica i dati: "ok per AI" e "vietato per AI". Almeno i referenti di reparto sono stati informati sulla classificazione.
D (4): Classificazione formale integrata nella piattaforma: i dati sensibili sono filtrati automaticamente prima di arrivare ai sistemi AI.
E (5): Come l'opzione D, con audit annuale sulla classificazione e test di robustezza del filtro.

**D3** ⚠️ CON "NON SO" | "Avete visibilita' su quali strumenti AI i dipendenti usano al di fuori di quelli autorizzati dall'azienda?"
A (1): No, nessuna visibilita'. Sappiamo che qualcuno usa ChatGPT, ma non sappiamo quanti, quanto spesso, o con quali dati.
**NS (1.5): Non ne sono sicuro. Credo che qualcuno in azienda (IT, sicurezza) se ne occupi, ma non ho visibilita' diretta.**
B (2): Sospettiamo che alcuni usino strumenti esterni, ma non monitoriamo. Ogni tanto sentiamo storie informali.
C (3): Abbiamo una regola che chiede di segnalare l'uso di nuovi strumenti, ma il monitoraggio e' manuale e non sempre rispettato.
D (4): Monitoriamo attivamente il traffico per identificare accessi a strumenti AI non autorizzati. Blocchiamo o registriamo.
E (5): Come l'opzione D, con audit trimestrale dei log e procedure di gestione se un dipendente usa strumenti vietati con dati sensibili.

**D4** ⚠️ CON "NON SO" | "Come controllate chi accede alla vostra piattaforma AI e cosa ci fa?"
A (1): Non abbiamo una piattaforma AI aziendale. Ogni dipendente usa il proprio account personale; nessun log.
**NS (1.5): Non ne sono sicuro. Credo che IT gestisca gli accessi, ma non ho visibilita' sul dettaglio.**
B (2): Abbiamo una piattaforma, ma tutti usano le stesse credenziali o non c'e' distinzione di ruoli. Non tracciamo chi fa cosa.
C (3): Ogni dipendente ha il proprio account. Log disponibili ma non revisionati regolarmente. Nessuna distinzione di ruoli per livello di accesso.
D (4): Accessi differenziati per ruolo (chi puo' fare cosa). Log completo di tutte le attivita'. Gli accessi vengono aggiornati quando cambia il ruolo o la persona lascia l'azienda.
E (5): Come l'opzione D, con audit trimestrale dei log per identificare anomalie, test annuale di sicurezza sulla piattaforma, backup che include i dati della piattaforma AI.

**D5** | "Fate verifiche periodiche sulla sicurezza dei vostri sistemi AI e avete una procedura in caso di fuga di dati?"
A (1): No, nessuna verifica. Se succede qualcosa, improvvisiamo.
B (2): Sappiamo che dovremmo, ma non abbiamo una procedura formale. In caso di incidente, contatteremo IT.
C (3): Abbiamo una procedura generica di sicurezza IT, ma non specifica per l'AI. Una volta l'anno controlliamo i log.
D (4): Audit trimestrale dei log della piattaforma AI. Procedura scritta per gestire fughe dati via AI: notifica management, isolamento, notifica interessati entro 72h. Test di sicurezza annuale.
E (5): Come l'opzione D, con report di audit visibile alla direzione, backup/disaster recovery verificati che includono la piattaforma AI, certificazione di sicurezza da parte terza.

---

### ASSE 6: TECNOLOGIA (key: tecnologia)

**T1** ⚠️ CON "NON SO" | "Che tipo di piattaforma AI usa la vostra azienda?"
A (1): Non abbiamo nessuna piattaforma AI aziendale.
**NS (1.5): Non ne sono sicuro. So che qualcuno in azienda usa strumenti AI, ma non so se esista una piattaforma centralizzata.**
B (2): Alcuni dipendenti hanno abbonamenti personali (ChatGPT Plus, Copilot, ecc.) senza coordinamento.
C (3): Abbiamo una piattaforma AI centralizzata, accessibile a tutto il team autorizzato, con gestione utenti.
D (4): Piattaforma centralizzata con gestione utenti e ruoli, piu' modelli AI disponibili, e almeno un collegamento con i sistemi aziendali (CRM, gestionale, ecc.).
E (5): Piattaforma completa con basi di conoscenza aziendali collegate, flussi di dati strutturati e integrazioni multiple.

**T2** | "Come sono configurati gli agenti AI nella vostra azienda? (un agente AI e' un assistente personalizzato per un compito specifico)"
A (1): Non abbiamo agenti AI configurati, o non sappiamo cosa siano.
B (2): Usiamo chatbot generici (es. ChatGPT) senza personalizzazione: nessun prompt specifico, nessuna knowledge base collegata.
C (3): 1-3 agenti configurati con prompt personalizzati per attivita' specifiche (es. FAQ, estrazione documenti, assistenza procedure).
D (4): 4-6 agenti personalizzati con knowledge base aziendali collegate; configurazione documentata e replicabile.
E (5): 7+ agenti specializzati con automazioni complesse, trigger automatici, knowledge base aggiornate, configurazione versionata.

**T3** ⚠️ CON "NON SO" | "La vostra piattaforma AI e' collegata ai vostri sistemi aziendali (gestionale, CRM, archivio documenti, email)?"
A (1): No, gli strumenti AI sono completamente separati da tutto il resto.
**NS (1.5): Non ne sono sicuro. Potrebbe esserci qualche collegamento gestito da IT, ma non ho visibilita'.**
B (2): No, ma stiamo valutando come collegarli (esportazioni manuali, copia-incolla).
C (3): Si', 1 integrazione pilota attiva (es. l'AI legge documenti dal nostro archivio).
D (4): Si', 2-3 integrazioni operative (es. AI accede al CRM, consulta il gestionale, legge le email).
E (5): Si', 4 o piu' integrazioni stabili con sincronizzazione automatica e flussi dati strutturati.

**T4** | "Come monitorate i costi e l'adozione degli strumenti AI in azienda?"
A (1): Non monitoriamo. Ogni persona ha il suo abbonamento e basta.
B (2): Monitoriamo il budget IT generale, ma non i costi specifici per gli strumenti AI.
C (3): Controllo costi approssimativo, ma senza metriche di utilizzo (non sappiamo chi usa cosa e quanto).
D (4): Dashboard con costi per utente, alert di budget e indicatori di adozione (chi usa, quanto, per cosa).
E (5): Reportistica avanzata: ROI per agente, costo per attivita', tendenze di adozione, limiti di spesa automatici e previsioni.

**T5** | "Avete una base di conoscenza aziendale (documenti, procedure, FAQ, manuali) che gli strumenti AI possono consultare automaticamente?"
A (1): No, i documenti sono sparsi in varie cartelle e gli strumenti AI non vi accedono.
B (2): Abbiamo documenti organizzati, ma gli strumenti AI non vi hanno accesso. La consultazione e' manuale.
C (3): Si', 1 base di conoscenza pilota connessa a 1-2 agenti; le procedure sono parzialmente strutturate.
D (4): Base di conoscenza centralizzata connessa a 3 o piu' agenti, con procedure standardizzate e accesso controllato.
E (5): Multiple basi di conoscenza per area (commerciale, tecnica, HR, ecc.) con aggiornamento automatico, versionamento e accesso differenziato.

---

## VALIDAZIONE

Per verificare che il quiz funzioni:

1. **Scoring Profilo A** (manifattura tradizionale): tutte A → media 1.0, overall 1.0, tutti semafori rosso
2. **"Non so"**: selezionare NS su D3, D4, T1, T3 → score 1.5 per quelle domande
3. **G2 score 2.5**: verificare che C (2.5) sia calcolata correttamente nella media
4. **Responsive**: 375px (iPhone) e 1440px (desktop)
5. **Navigazione**: avanti/indietro senza perdere risposte
