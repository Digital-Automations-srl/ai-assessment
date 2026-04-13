import type { ContextQuestion, Axis } from "./types";

export const CONTEXT_QUESTIONS: ContextQuestion[] = [
  {
    id: "X1",
    text: "Qual e' il settore principale della vostra azienda?",
    options: [
      "Manifattura e produzione",
      "Distribuzione e retail",
      "Servizi professionali",
      "Costruzioni e impianti",
      "Logistica e trasporti",
      "Formazione e education",
      "IT e tecnologia",
      "Altro",
    ],
  },
  {
    id: "X2",
    text: "Quanti dipendenti ha la vostra azienda?",
    options: [
      "Meno di 10",
      "10-50",
      "51-100",
      "101-250",
      "Piu' di 250",
    ],
  },
  {
    id: "X3",
    text: "Qual e' il suo ruolo in azienda?",
    options: [
      "Titolare / CEO",
      "Direzione generale (AD, DG)",
      "IT / CTO",
      "HR / Risorse Umane",
      "Amministrazione e finanza",
      "Altro",
    ],
  },
];

export const AXES: Axis[] = [
  {
    key: "conformita",
    label: "Conformita'",
    formal: "Compliance",
    questions: [
      {
        id: "C1",
        text: "In azienda, chi conosce l'esistenza delle nuove norme sull'intelligenza artificiale e i relativi obblighi?",
        options: [
          { letter: "A", score: 1, text: "Nessuno. Non sappiamo che esistano obblighi normativi legati all'AI." },
          { letter: "B", score: 2, text: "Il CEO/direzione ne hanno sentito parlare, ma non e' una priorita' e non abbiamo fatto nulla di concreto." },
          { letter: "C", score: 3, text: "Abbiamo nominato una persona responsabile che sta raccogliendo informazioni e ha iniziato a lavorarci." },
          { letter: "D", score: 4, text: "Responsabile dedicato attivo; abbiamo un piano concreto in esecuzione con documentazione in corso." },
          { letter: "E", score: 5, text: "Responsabile dedicato, piano consolidato, revisioni periodiche programmate." },
        ],
      },
      {
        id: "C2",
        text: "Fate un elenco degli strumenti o software con intelligenza artificiale usati in azienda?",
        options: [
          { letter: "A", score: 1, text: "No, nessun elenco. Ogni reparto usa quello che vuole senza coordinamento." },
          { letter: "B", score: 2, text: "Non formalizzato, ma il management sa vagamente quali sistemi usiamo." },
          { letter: "C", score: 3, text: "Abbiamo iniziato a fare un elenco, ma e' incompleto o non aggiornato." },
          { letter: "D", score: 4, text: "Elenco completo e aggiornato: per ogni strumento documentiamo chi lo usa, per quale attivita', con quale livello di rischio (basso/medio/alto). Abbiamo verificato che nessun uso rientri in pratiche vietate." },
          { letter: "E", score: 5, text: "Registro aggiornato con procedura obbligatoria prima di adottare ogni nuovo strumento. Revisione almeno semestrale che include screening pratiche vietate e riclassificazione del rischio." },
        ],
      },
      {
        id: "C3",
        text: "Quando usate intelligenza artificiale con dati di dipendenti, clienti o fornitori, li informate esplicitamente che i loro dati vengono trattati con AI e quali sono le implicazioni?",
        options: [
          { letter: "A", score: 1, text: "No, non lo comunichiamo. Non ci abbiamo pensato." },
          { letter: "B", score: 2, text: "Accennato nel contratto generico o nella privacy policy, ma non in modo specifico per l'AI." },
          { letter: "C", score: 3, text: "Stiamo scrivendo documenti specifici; alcuni gia' aggiornati per i trattamenti principali." },
          { letter: "D", score: 4, text: "Documenti specifici aggiornati per tutti i trattamenti principali; informative chiare per dipendenti, clienti, fornitori." },
          { letter: "E", score: 5, text: "Informative complete, revisionate periodicamente, con linguaggio comprensibile e verifiche di conformita'." },
        ],
      },
      {
        id: "C4",
        text: "Il personale che usa strumenti AI ha ricevuto formazione su rischi, utilizzo corretto e conseguenze legali dell'uso scorretto?",
        options: [
          { letter: "A", score: 1, text: "No, nessuna formazione specifica su questo tema." },
          { letter: "B", score: 2, text: "Qualcuno si e' informato per conto suo (corsi online, articoli), ma niente di organizzato dall'azienda." },
          { letter: "C", score: 3, text: "Formazione avviata o in preparazione; copertura parziale (meno del 50% del personale coinvolto)." },
          { letter: "D", score: 4, text: "Formazione strutturata erogata; oltre il 50% del personale gia' formato; piano per completare il resto." },
          { letter: "E", score: 5, text: "100% del personale interessato formato; percorso ripetuto ogni anno; verifica di comprensione documentata." },
        ],
      },
      {
        id: "C5",
        text: "Quando adottate un nuovo strumento AI che tratta dati personali o prende decisioni che impattano su persone, fate una valutazione d'impatto scritta sui rischi per l'azienda, i dipendenti e i clienti?",
        options: [
          { letter: "A", score: 1, text: "No, lo scegliamo se ci piace e basta." },
          { letter: "B", score: 2, text: "Ci pensiamo, ma non c'e' un processo formale ne' una documentazione scritta." },
          { letter: "C", score: 3, text: "Abbiamo fatto almeno una valutazione d'impatto scritta per i trattamenti AI che coinvolgono dati personali." },
          { letter: "D", score: 4, text: "Valutazione d'impatto completata per tutti i trattamenti AI ad alto rischio o su larga scala; documentazione archiviata e consultabile; procedura obbligatoria prima di ogni nuova adozione." },
          { letter: "E", score: 5, text: "Valutazioni riviste periodicamente; audit interno almeno semestrale; tracciamento decisioni con evidenze documentate." },
        ],
      },
    ],
  },
  {
    key: "processi",
    label: "Processi e Controlli",
    formal: "Governance",
    questions: [
      {
        id: "G1",
        text: "Come sono definite le regole per l'uso dell'intelligenza artificiale nella vostra azienda?",
        options: [
          { letter: "A", score: 1, text: "Non abbiamo regole. Ogni persona usa gli strumenti AI come crede." },
          { letter: "B", score: 2, text: "Diamo indicazioni a voce (\"non caricate dati di clienti su ChatGPT\"), ma niente di scritto." },
          { letter: "C", score: 3, text: "Abbiamo una policy d'uso AI scritta e distribuita. Almeno il 50% dei destinatari la conosce e sa citare le regole principali." },
          { letter: "D", score: 4, text: "La policy e' firmata da tutti i dipendenti interessati. Abbiamo verificato l'aderenza almeno una volta (audit, survey, o colloqui). L'abbiamo aggiornata almeno una volta." },
          { letter: "E", score: 5, text: "Le regole sull'AI sono integrate nei processi normali (onboarding, manuale dipendente, procedure operative). Riviste ogni anno con evidenza documentata." },
        ],
      },
      {
        id: "G2",
        text: "Quando la vostra azienda valuta l'adozione di un nuovo strumento AI, chi lo approva e con quale procedura?",
        options: [
          { letter: "A", score: 1, text: "Non c'e' un processo. Se serve a qualcuno, lo usiamo." },
          { letter: "B", score: 2, text: "A volte lo si chiede al responsabile; a volte si fa direttamente. Niente di strutturato." },
          { letter: "C", score: 2.5, text: "Abbiamo una checklist informale (dati sensibili? privacy? licenze?) ma non e' ancora una procedura scritta." },
          { letter: "D", score: 4, text: "Procedura scritta: chi vuole usare un nuovo strumento AI compila una richiesta. Un responsabile lo approva verificando dati, sicurezza, conformita'. Lo classifichiamo come \"via libera\", \"con condizioni\" o \"vietato\"." },
          { letter: "E", score: 5, text: "La procedura e' integrata nel processo di acquisti e change management. Tutti i nuovi strumenti (AI e non) seguono lo stesso percorso. Verifica ogni 6 mesi." },
        ],
      },
      {
        id: "G3",
        text: "Chi e' responsabile della governance e della sicurezza dell'AI nella vostra azienda?",
        options: [
          { letter: "A", score: 1, text: "Nessuno in particolare. Non abbiamo assegnato questa responsabilita'." },
          { letter: "B", score: 2, text: "Ne parla il CEO o il direttore, ma non e' un ruolo formalizzato. Se ne occupa \"quando serve\"." },
          { letter: "C", score: 3, text: "Abbiamo identificato un responsabile (o un piccolo gruppo) con compiti definiti per iscritto. Ha completato almeno un'azione concreta." },
          { letter: "D", score: 4, text: "Un responsabile AI (o comitato) e' operativo: ha approvato gli ultimi nuovi strumenti, supervisiona l'uso, comunica rischi al management." },
          { letter: "E", score: 5, text: "La governance AI e' affidata a un referente/comitato con meeting regolari, metriche tracciate e coinvolgimento di management, IT, compliance. Revisione annuale dei rischi." },
        ],
      },
      {
        id: "G4",
        text: "Distinguete i diversi usi dell'AI in base al rischio? (es. usare AI per scrivere email vs usarla per decisioni su dipendenti o clienti)",
        options: [
          { letter: "A", score: 1, text: "No, usiamo gli stessi strumenti per tutto senza distinzione." },
          { letter: "B", score: 2, text: "Sappiamo che certi usi sono piu' rischiosi, ma non abbiamo una classificazione scritta." },
          { letter: "C", score: 3, text: "Abbiamo una classificazione scritta (basso, medio, alto rischio) e la usiamo quando approviamo nuovi strumenti, ma non per tutte le attivita' gia' in corso." },
          { letter: "D", score: 4, text: "Usiamo un sistema formale per qualificare ogni attivita' AI: quali dati tratta, che impatto ha, e' conforme? Lo applichiamo sia ai nuovi strumenti sia a quelli esistenti." },
          { letter: "E", score: 5, text: "La classificazione del rischio e' integrata nei processi aziendali standard. La aggiorniamo quando emergono nuovi rischi. Tracciamo metriche (quanti usi a rischio alto, medio, basso)." },
        ],
      },
      {
        id: "G5",
        text: "Come monitorate l'uso reale dell'AI in azienda? Avete un processo per gestire problemi o violazioni delle regole?",
        options: [
          { letter: "A", score: 1, text: "Non monitoriamo. Se scopriamo un problema, lo affrontiamo sul momento." },
          { letter: "B", score: 2, text: "Il management e' consapevole e ogni tanto chiede feedback, ma non c'e' un sistema strutturato." },
          { letter: "C", score: 3, text: "Abbiamo un registro base degli strumenti e di chi li usa. Rivediamo la policy almeno una volta l'anno. Non c'e' un processo formale per gestire gli incidenti." },
          { letter: "D", score: 4, text: "Monitoriamo l'uso (quali strumenti, chi accede, anomalie). Abbiamo un processo per segnalare e investigare i problemi. Rivediamo la policy ogni 6-12 mesi." },
          { letter: "E", score: 5, text: "Monitoraggio sistematico (log, dashboard). Incidenti gestiti con processo formale (segnalazione, investigazione, correzione documentata). Policy rivista annualmente con input da tutte le funzioni. Metriche reportate al management." },
        ],
      },
    ],
  },
  {
    key: "utilizzo",
    label: "Utilizzo Reale",
    formal: "Adoption",
    questions: [
      {
        id: "A1",
        text: "Quanti dipendenti della vostra azienda usano strumenti AI nel lavoro, anche occasionalmente?",
        options: [
          { letter: "A", score: 1, text: "Nessuno, o solo 1-2 persone che lo fanno per conto proprio." },
          { letter: "B", score: 2, text: "Circa il 5-15% dei dipendenti, per iniziativa personale senza coordinamento." },
          { letter: "C", score: 3, text: "Circa il 15-30%, con qualche coordinamento: sanno cosa usare e per cosa." },
          { letter: "D", score: 4, text: "Il 30-60% dei dipendenti usa l'AI regolarmente in piu' reparti." },
          { letter: "E", score: 5, text: "Oltre il 60%, come parte del lavoro quotidiano." },
        ],
      },
      {
        id: "A2",
        text: "Come viene usata l'AI nella vostra azienda?",
        options: [
          { letter: "A", score: 1, text: "Ogni persona fa da se', nessun coordinamento. Ognuno usa strumenti diversi." },
          { letter: "B", score: 2, text: "Pochi usano lo stesso strumento, ma senza processi definiti. Molti sperimentano in modo casuale." },
          { letter: "C", score: 3, text: "Un team o un reparto usa l'AI in modo coordinato per attivita' specifiche e definite." },
          { letter: "D", score: 4, text: "2-3 reparti hanno processi AI definiti e documentati, con guide interne." },
          { letter: "E", score: 5, text: "L'AI e' integrata nei flussi standard. Tutti i reparti principali hanno processi codificati." },
        ],
      },
      {
        id: "A3",
        text: "Avete agenti AI o automazioni configurate per attivita' specifiche (es. rispondere a domande frequenti, estrarre dati da documenti, assistere il commerciale)?",
        options: [
          { letter: "A", score: 1, text: "Nessuno. Usiamo solo chatbot generici senza configurazione." },
          { letter: "B", score: 2, text: "1 agente o automazione informale (es. un bot di prova), non usato regolarmente." },
          { letter: "C", score: 3, text: "1-3 agenti configurati per attivita' specifiche e usati regolarmente dal team." },
          { letter: "D", score: 4, text: "4-6 agenti attivi in almeno 2 reparti diversi, con risultati documentati." },
          { letter: "E", score: 5, text: "7 o piu' agenti integrati in processi critici su 3 o piu' reparti." },
        ],
      },
      {
        id: "A4",
        text: "Come documentate i vostri casi d'uso AI? (quali attivita' fate con l'AI, come, con quali risultati)",
        options: [
          { letter: "A", score: 1, text: "Non documentati. Ogni persona sa cosa fa, ma non c'e' una mappa condivisa." },
          { letter: "B", score: 2, text: "Documentazione informale (note, email, chat). Difficile replicare o condividere." },
          { letter: "C", score: 3, text: "2-3 processi documentati con istruzioni condivise e un referente per ciascuno." },
          { letter: "D", score: 4, text: "4-6 processi documentati con checklist, ruoli chiari e aggiornamento regolare." },
          { letter: "E", score: 5, text: "Tutti i processi AI mappati, versionati, con formazione periodica. Cultura della condivisione." },
        ],
      },
      {
        id: "A5",
        text: "Misurate l'impatto dell'AI sulle vostre attivita'? (tempo risparmiato, errori ridotti, costi, soddisfazione)",
        options: [
          { letter: "A", score: 1, text: "Non misuriamo nulla. Abbiamo un'impressione generica (\"funziona bene\") ma nessun dato." },
          { letter: "B", score: 2, text: "Feedback verbali e impressioni. Nessun dato strutturato." },
          { letter: "C", score: 3, text: "1-2 indicatori tracciati per i processi principali (es. tempo di risposta, volume gestito)." },
          { letter: "D", score: 4, text: "KPI specifici per agente/processo. ROI stimato per almeno 1 area. Monitoraggio regolare." },
          { letter: "E", score: 5, text: "Dashboard con metriche di impatto in tempo reale. ROI tracciato per ogni agente. Analisi periodica con la direzione." },
        ],
      },
    ],
  },
  {
    key: "autonomia",
    label: "Autonomia Team",
    formal: "AI Skills",
    questions: [
      {
        id: "S1",
        text: "Nel vostro team, quanta esperienza pratica c'e' con strumenti di intelligenza artificiale?",
        options: [
          { letter: "A", score: 1, text: "Nessuna. Qualcuno ha provato ChatGPT per curiosita' personale, ma non fa parte del lavoro." },
          { letter: "B", score: 2, text: "Alcuni colleghi hanno seguito corsi online per conto proprio. Usano l'AI saltuariamente, senza un metodo condiviso." },
          { letter: "C", score: 3, text: "Abbiamo organizzato formazione interna strutturata. La maggior parte del team sa usare almeno uno strumento AI e ne conosce i limiti." },
          { letter: "D", score: 4, text: "Il team usa regolarmente strumenti AI. Abbiamo 2-3 \"esperti interni\" che supportano i colleghi e creano guide su come usarli correttamente." },
          { letter: "E", score: 5, text: "L'AI e' integrata nel lavoro quotidiano. Gli esperti interni formano i nuovi colleghi, il team propone autonomamente nuovi casi d'uso." },
        ],
      },
      {
        id: "S2",
        text: "La direzione della vostra azienda sa: quali dati non si possono usare con l'AI? Come valutare il rischio di un nuovo strumento? Quali sono gli obblighi normativi?",
        options: [
          { letter: "A", score: 1, text: "No. Per noi \"AI\" significa soprattutto automazione e produttivita'. Non pensiamo a rischi normativi." },
          { letter: "B", score: 2, text: "Idea vaga che \"dati personali e AI\" sono collegati, ma nessun processo formale per valutare uno strumento." },
          { letter: "C", score: 3, text: "Il management ha ricevuto formazione base su governance AI: conosce i rischi, gli obblighi, ed e' in grado di citare almeno 2 rischi concreti legati all'uso dell'AI in azienda." },
          { letter: "D", score: 4, text: "Management valuta autonomamente nuovi strumenti rispetto a conformita', privacy, impatto. Processo documentato con referente che verifica." },
          { letter: "E", score: 5, text: "Management integra l'AI nelle scelte strategiche con piena consapevolezza. Triage strutturato per ogni nuovo strumento, formazione aggiornata annualmente." },
        ],
      },
      {
        id: "S3",
        text: "Nel vostro team, c'e' almeno una persona che sa creare contenuti efficaci con l'AI, configurare uno strumento, e potrebbe insegnarlo a un collega?",
        options: [
          { letter: "A", score: 1, text: "No, nessuno ha queste competenze. Quando serve, chiediamo a fornitori esterni." },
          { letter: "B", score: 2, text: "1-2 persone hanno queste capacita', ma in modo autodidatta. Non sono riconosciute come referenti." },
          { letter: "C", score: 3, text: "Abbiamo identificato 2-3 referenti interni (\"campioni AI\"). Hanno ricevuto formazione strutturata e sanno usare la piattaforma e configurare strumenti base." },
          { letter: "D", score: 4, text: "I nostri campioni AI operano in autonomia: configurano strumenti avanzati, supportano il team senza bisogno di assistenza esterna costante." },
          { letter: "E", score: 5, text: "Abbiamo una rete interna di campioni AI che si formano a vicenda. Almeno uno puo' formare nuovi colleghi. Esiste un canale formale per dubbi tecnici e normativi." },
        ],
      },
      {
        id: "S4",
        text: "Quanto il vostro team e' in grado di usare strumenti AI senza assistenza esterna per le attivita' quotidiane?",
        options: [
          { letter: "A", score: 1, text: "Per niente. Ogni volta abbiamo bisogno di supporto esterno o di IT." },
          { letter: "B", score: 2, text: "Parzialmente. Il team prova, ma spesso deve chiedere aiuto quando qualcosa non funziona o il risultato non sembra affidabile." },
          { letter: "C", score: 3, text: "Si', il team usa gli strumenti in autonomia per la maggior parte dei compiti. Chiediamo supporto solo per situazioni particolari." },
          { letter: "D", score: 4, text: "Completamente autonomo. Il team sa usare gli strumenti, risolvere problemi comuni, e sa quando chiedere aiuto (es. rischio normativo, dato sensibile)." },
          { letter: "E", score: 5, text: "Autonomo e proattivo: propone nuovi casi d'uso, valuta in autonomia se uno strumento e' affidabile, identifica rischi prima di usarlo." },
        ],
      },
      {
        id: "S5",
        text: "Quando scoprite un nuovo strumento AI, la vostra organizzazione e' in grado di valutare se e' utile e sicuro, autorizzarlo, e formare i colleghi?",
        options: [
          { letter: "A", score: 1, text: "No. Qualcuno lo prova per conto suo, il management non sa se e' stato valutato o autorizzato." },
          { letter: "B", score: 2, text: "Cerchiamo una valutazione (da IT o un consulente), ma non c'e' un processo strutturato. La formazione e' informale." },
          { letter: "C", score: 3, text: "Abbiamo un processo: quando emerge un nuovo strumento, chiediamo una valutazione. Se approvato, facciamo una breve formazione." },
          { letter: "D", score: 4, text: "Processo formale e documentato. I referenti AI sanno valutare utilita' e conformita'. La formazione e' strutturata. Aggiornamenti ogni 3-6 mesi." },
          { letter: "E", score: 5, text: "Valutazione autonoma e rapida. I campioni AI formano i colleghi. Cultura di apprendimento continuo: il team propone casi d'uso, le esperienze vengono documentate e condivise." },
        ],
      },
    ],
  },
  {
    key: "protezione",
    label: "Protezione Dati",
    formal: "Data Security",
    questions: [
      {
        id: "D1",
        text: "Come accedono i vostri dipendenti agli strumenti di intelligenza artificiale?",
        options: [
          { letter: "A", score: 1, text: "Usano strumenti gratuiti o personali (ChatGPT free, Gemini free, ecc.) con dati aziendali, senza controllo." },
          { letter: "B", score: 2, text: "Abbiamo vietato gli strumenti AI pubblici, ma non offriamo un'alternativa. Chi ne ha bisogno chiede eccezioni caso per caso." },
          { letter: "C", score: 3, text: "Abbiamo una piattaforma AI aziendale con accessi gestiti. I dipendenti la usano come alternativa, ma alcuni usano ancora strumenti esterni." },
          { letter: "D", score: 4, text: "Piattaforma AI aziendale con autenticazione e controllo accessi per ruolo. I dati non escono dal perimetro aziendale. Gli strumenti non autorizzati sono bloccati o monitorati." },
          { letter: "E", score: 5, text: "Come l'opzione D, con audit periodico dei log di accesso e procedura di risposta in caso di violazioni." },
        ],
      },
      {
        id: "D2",
        text: "Avete definito quali dati aziendali possono essere usati con strumenti AI e quali no?",
        options: [
          { letter: "A", score: 1, text: "No, i dipendenti decidono autonomamente cosa condividere con gli strumenti AI." },
          { letter: "B", score: 2, text: "Sappiamo che alcuni dati non dovrebbero andare su ChatGPT (password, dati bancari), ma non abbiamo una lista formale. La regola e' \"usa il buonsenso\"." },
          { letter: "C", score: 3, text: "Abbiamo un documento che classifica i dati: \"ok per AI\" e \"vietato per AI\". Almeno i referenti di reparto sono stati informati sulla classificazione." },
          { letter: "D", score: 4, text: "Classificazione formale integrata nella piattaforma: i dati sensibili sono filtrati automaticamente prima di arrivare ai sistemi AI." },
          { letter: "E", score: 5, text: "Come l'opzione D, con audit annuale sulla classificazione e test di robustezza del filtro." },
        ],
      },
      {
        id: "D3",
        text: "Avete visibilita' su quali strumenti AI i dipendenti usano al di fuori di quelli autorizzati dall'azienda?",
        options: [
          { letter: "A", score: 1, text: "No, nessuna visibilita'. Sappiamo che qualcuno usa ChatGPT, ma non sappiamo quanti, quanto spesso, o con quali dati." },
          { letter: "?", score: 1.5, text: "Non ne sono sicuro. Credo che qualcuno in azienda (IT, sicurezza) se ne occupi, ma non ho visibilita' diretta.", isNonSo: true },
          { letter: "B", score: 2, text: "Sospettiamo che alcuni usino strumenti esterni, ma non monitoriamo. Ogni tanto sentiamo storie informali." },
          { letter: "C", score: 3, text: "Abbiamo una regola che chiede di segnalare l'uso di nuovi strumenti, ma il monitoraggio e' manuale e non sempre rispettato." },
          { letter: "D", score: 4, text: "Monitoriamo attivamente il traffico per identificare accessi a strumenti AI non autorizzati. Blocchiamo o registriamo." },
          { letter: "E", score: 5, text: "Come l'opzione D, con audit trimestrale dei log e procedure di gestione se un dipendente usa strumenti vietati con dati sensibili." },
        ],
      },
      {
        id: "D4",
        text: "Come controllate chi accede alla vostra piattaforma AI e cosa ci fa?",
        options: [
          { letter: "A", score: 1, text: "Non abbiamo una piattaforma AI aziendale. Ogni dipendente usa il proprio account personale; nessun log." },
          { letter: "?", score: 1.5, text: "Non ne sono sicuro. Credo che IT gestisca gli accessi, ma non ho visibilita' sul dettaglio.", isNonSo: true },
          { letter: "B", score: 2, text: "Abbiamo una piattaforma, ma tutti usano le stesse credenziali o non c'e' distinzione di ruoli. Non tracciamo chi fa cosa." },
          { letter: "C", score: 3, text: "Ogni dipendente ha il proprio account. Log disponibili ma non revisionati regolarmente. Nessuna distinzione di ruoli per livello di accesso." },
          { letter: "D", score: 4, text: "Accessi differenziati per ruolo (chi puo' fare cosa). Log completo di tutte le attivita'. Gli accessi vengono aggiornati quando cambia il ruolo o la persona lascia l'azienda." },
          { letter: "E", score: 5, text: "Come l'opzione D, con audit trimestrale dei log per identificare anomalie, test annuale di sicurezza sulla piattaforma, backup che include i dati della piattaforma AI." },
        ],
      },
      {
        id: "D5",
        text: "Fate verifiche periodiche sulla sicurezza dei vostri sistemi AI e avete una procedura in caso di fuga di dati?",
        options: [
          { letter: "A", score: 1, text: "No, nessuna verifica. Se succede qualcosa, improvvisiamo." },
          { letter: "B", score: 2, text: "Sappiamo che dovremmo, ma non abbiamo una procedura formale. In caso di incidente, contatteremo IT." },
          { letter: "C", score: 3, text: "Abbiamo una procedura generica di sicurezza IT, ma non specifica per l'AI. Una volta l'anno controlliamo i log." },
          { letter: "D", score: 4, text: "Audit trimestrale dei log della piattaforma AI. Procedura scritta per gestire fughe dati via AI: notifica management, isolamento, notifica interessati entro 72h. Test di sicurezza annuale." },
          { letter: "E", score: 5, text: "Come l'opzione D, con report di audit visibile alla direzione, backup/disaster recovery verificati che includono la piattaforma AI, certificazione di sicurezza da parte terza." },
        ],
      },
    ],
  },
  {
    key: "tecnologia",
    label: "Tecnologia",
    formal: "Technology",
    questions: [
      {
        id: "T1",
        text: "Che tipo di piattaforma AI usa la vostra azienda?",
        options: [
          { letter: "A", score: 1, text: "Non abbiamo nessuna piattaforma AI aziendale." },
          { letter: "?", score: 1.5, text: "Non ne sono sicuro. So che qualcuno in azienda usa strumenti AI, ma non so se esista una piattaforma centralizzata.", isNonSo: true },
          { letter: "B", score: 2, text: "Alcuni dipendenti hanno abbonamenti personali (ChatGPT Plus, Copilot, ecc.) senza coordinamento." },
          { letter: "C", score: 3, text: "Abbiamo una piattaforma AI centralizzata, accessibile a tutto il team autorizzato, con gestione utenti." },
          { letter: "D", score: 4, text: "Piattaforma centralizzata con gestione utenti e ruoli, piu' modelli AI disponibili, e almeno un collegamento con i sistemi aziendali (CRM, gestionale, ecc.)." },
          { letter: "E", score: 5, text: "Piattaforma completa con basi di conoscenza aziendali collegate, flussi di dati strutturati e integrazioni multiple." },
        ],
      },
      {
        id: "T2",
        text: "Come sono configurati gli agenti AI nella vostra azienda? (un agente AI e' un assistente personalizzato per un compito specifico)",
        options: [
          { letter: "A", score: 1, text: "Non abbiamo agenti AI configurati, o non sappiamo cosa siano." },
          { letter: "B", score: 2, text: "Usiamo chatbot generici (es. ChatGPT) senza personalizzazione: nessun prompt specifico, nessuna knowledge base collegata." },
          { letter: "C", score: 3, text: "1-3 agenti configurati con prompt personalizzati per attivita' specifiche (es. FAQ, estrazione documenti, assistenza procedure)." },
          { letter: "D", score: 4, text: "4-6 agenti personalizzati con knowledge base aziendali collegate; configurazione documentata e replicabile." },
          { letter: "E", score: 5, text: "7+ agenti specializzati con automazioni complesse, trigger automatici, knowledge base aggiornate, configurazione versionata." },
        ],
      },
      {
        id: "T3",
        text: "La vostra piattaforma AI e' collegata ai vostri sistemi aziendali (gestionale, CRM, archivio documenti, email)?",
        options: [
          { letter: "A", score: 1, text: "No, gli strumenti AI sono completamente separati da tutto il resto." },
          { letter: "?", score: 1.5, text: "Non ne sono sicuro. Potrebbe esserci qualche collegamento gestito da IT, ma non ho visibilita'.", isNonSo: true },
          { letter: "B", score: 2, text: "No, ma stiamo valutando come collegarli (esportazioni manuali, copia-incolla)." },
          { letter: "C", score: 3, text: "Si', 1 integrazione pilota attiva (es. l'AI legge documenti dal nostro archivio)." },
          { letter: "D", score: 4, text: "Si', 2-3 integrazioni operative (es. AI accede al CRM, consulta il gestionale, legge le email)." },
          { letter: "E", score: 5, text: "Si', 4 o piu' integrazioni stabili con sincronizzazione automatica e flussi dati strutturati." },
        ],
      },
      {
        id: "T4",
        text: "Come monitorate i costi e l'adozione degli strumenti AI in azienda?",
        options: [
          { letter: "A", score: 1, text: "Non monitoriamo. Ogni persona ha il suo abbonamento e basta." },
          { letter: "B", score: 2, text: "Monitoriamo il budget IT generale, ma non i costi specifici per gli strumenti AI." },
          { letter: "C", score: 3, text: "Controllo costi approssimativo, ma senza metriche di utilizzo (non sappiamo chi usa cosa e quanto)." },
          { letter: "D", score: 4, text: "Dashboard con costi per utente, alert di budget e indicatori di adozione (chi usa, quanto, per cosa)." },
          { letter: "E", score: 5, text: "Reportistica avanzata: ROI per agente, costo per attivita', tendenze di adozione, limiti di spesa automatici e previsioni." },
        ],
      },
      {
        id: "T5",
        text: "Avete una base di conoscenza aziendale (documenti, procedure, FAQ, manuali) che gli strumenti AI possono consultare automaticamente?",
        options: [
          { letter: "A", score: 1, text: "No, i documenti sono sparsi in varie cartelle e gli strumenti AI non vi accedono." },
          { letter: "B", score: 2, text: "Abbiamo documenti organizzati, ma gli strumenti AI non vi hanno accesso. La consultazione e' manuale." },
          { letter: "C", score: 3, text: "Si', 1 base di conoscenza pilota connessa a 1-2 agenti; le procedure sono parzialmente strutturate." },
          { letter: "D", score: 4, text: "Base di conoscenza centralizzata connessa a 3 o piu' agenti, con procedure standardizzate e accesso controllato." },
          { letter: "E", score: 5, text: "Multiple basi di conoscenza per area (commerciale, tecnica, HR, ecc.) con aggiornamento automatico, versionamento e accesso differenziato." },
        ],
      },
    ],
  },
];
