import type { AxisKey } from "./types";

interface LevelContent {
  risk: string;
  opportunity: string;
}

// For each axis, content per score range: risk (what they're losing/risking) + opportunity (what they're missing)
export const AXIS_INSIGHTS: Record<AxisKey, LevelContent[]> = {
  conformita: [
    // index 0 = unused
    { risk: "", opportunity: "" },
    // index 1 = score 1.0-1.4
    {
      risk: "L'azienda e' esposta a sanzioni concrete: l'AI Act prevede fino al 7% del fatturato globale, il GDPR fino a 20M EUR o il 4% del fatturato. Per una PMI, anche sanzioni minori possono compromettere la liquidita'. La L.132/2025 aggiunge responsabilita' dirette per i vertici.",
      opportunity: "Adottare un framework minimo di compliance AI apre l'accesso a bandi pubblici e appalti che richiedono dichiarazioni di conformita'. I clienti enterprise e PA stanno gia' escludendo fornitori privi di garanzie documentate sull'uso dell'AI.",
    },
    // index 2 = score 1.5-2.4
    {
      risk: "Le lacune documentali sono un'area di rischio concreta: in caso di audit o incidente, l'assenza di registri e valutazioni d'impatto (DPIA) puo' tradursi in sanzioni GDPR da 10.000 a 500.000 EUR.",
      opportunity: "Completare la documentazione esistente richiede uno sforzo limitato ma produce un vantaggio competitivo: contratti piu' solidi con clienti esigenti e copertura assicurativa cyber piu' favorevole.",
    },
    // index 3 = score 2.5-3.4
    {
      risk: "La conformita' e' parziale: alcune aree rimangono scoperte, esponendovi a contestazioni in caso di ispezioni o reclami. Le sanzioni per violazioni documentate possono raggiungere 1-3 milioni EUR.",
      opportunity: "Consolidare il livello raggiunto con procedure standardizzate permette di certificarsi (es. ISO 42001) e accedere a un mercato crescente di committenti che richiedono fornitori AI-compliant.",
    },
    // index 4 = score 3.5-4.4
    {
      risk: "Il rischio residuo e' basso ma presente: aggiornamenti normativi frequenti possono rendere obsolete procedure attualmente corrette. Un monitoraggio discontinuo espone a gap involontari.",
      opportunity: "Siete vicini a poter usare la conformita' come leva commerciale certificata, riducendo i costi assicurativi e aprendo mercati esteri con requisiti normativi elevati.",
    },
    // index 5 = score 4.5-5.0
    {
      risk: "Il rischio normativo e' minimo e gestito proattivamente. L'unica esposizione riguarda scenari di cambiamento normativo rapido o tecnologie AI non ancora coperte dai framework esistenti.",
      opportunity: "Potete diventare un riferimento di settore sulla conformita' AI, offrire garanzie contrattuali che i concorrenti non possono replicare e attrarre talenti sensibili ai temi ESG.",
    },
  ],
  processi: [
    { risk: "", opportunity: "" },
    {
      risk: "L'azienda opera senza presidio sui sistemi AI: decisioni critiche vengono prese da algoritmi non verificati, dati dei clienti trattati in modo non conforme. Il management risponde personalmente di ogni errore.",
      opportunity: "Costruire anche solo una policy base consente di scalare l'uso dell'AI riducendo i rischi. La governance AI sta diventando requisito di gara: chi la costruisce ora conquista clienti enterprise prima dei concorrenti.",
    },
    {
      risk: "Nessuna procedura strutturata: fornitori AI non valutati sistematicamente, responsabilita' ambigue in caso di errore, compliance normativa esposta a contestazioni.",
      opportunity: "Con processi minimi formalizzati, l'azienda replica le pratiche che funzionano e blocca quelle rischiose. La governance AI e' un differenziatore competitivo concreto.",
    },
    {
      risk: "I processi coprono i casi principali ma presentano lacune nella gestione dei fornitori AI e nella tracciabilita' delle decisioni automatizzate, aree nel mirino dei regolatori.",
      opportunity: "Colmare le lacune permette di passare da governance reattiva a proattiva, accedere a bandi pubblici con standard documentati e differenziarsi nel proprio mercato.",
    },
    {
      risk: "La governance e' solida ma l'inconsistenza applicativa tra team puo' generare esposizioni normative in contesti di audit o due diligence.",
      opportunity: "Standardizzare i controlli riduce il carico operativo della compliance e posiziona l'azienda come partner affidabile per grandi clienti. La governance matura e' un moltiplicatore di fiducia.",
    },
    {
      risk: "Rischio residuo minimo. L'unica esposizione riguarda il mantenimento dell'efficacia dei controlli al variare rapido delle tecnologie e dei quadri normativi.",
      opportunity: "L'azienda puo' monetizzare la propria maturita': certificazioni AI Act-ready, partnership con grandi aziende e leadership di mercato comunicabile come asset strategico.",
    },
  ],
  utilizzo: [
    { risk: "", opportunity: "" },
    {
      risk: "Shadow AI diffusa: i dipendenti usano strumenti non autorizzati con dati sensibili. I risultati sono casuali, non replicabili e dipendono da chi ha trovato lo strumento giusto per caso.",
      opportunity: "Anche un minimo di coordinamento sblocca 2-4 ore/settimana per dipendente. I competitor che hanno avviato programmi pilota stanno aumentando la produttivita' del 15-20% su task ripetitivi.",
    },
    {
      risk: "L'uso sporadico crea duplicazione: team diversi reinventano le stesse soluzioni AI senza condividere prompt, workflow o risultati. Il valore resta individuale e non scala.",
      opportunity: "Standardizzare 3-5 casi d'uso condivisi (email, sintesi documenti, report) vale 3-6 ore/settimana per team. Senza coordinamento, queste ore restano invisibili al management.",
    },
    {
      risk: "Il rischio principale e' la dipendenza da singole persone: chi sa usare l'AI diventa collo di bottiglia. Se queste figure escono, il know-how si perde. Il ROI resta non misurabile.",
      opportunity: "A questo livello e' possibile avviare automazioni che riducono i tempi ciclo del 30-40% su onboarding clienti, preventivi, supporto interno. Senza un piano, questa finestra si chiude.",
    },
    {
      risk: "L'uso e' buono ma non integrato nei KPI aziendali. Senza metriche, e' impossibile giustificare investimenti e l'entusiasmo iniziale si esaurisce senza risultati dimostrabili.",
      opportunity: "Le aziende a questo livello che formalizzano metriche ottengono un ROI documentato di 3-5x entro 12 mesi. Mancano pochi passi per trasformare l'AI da strumento personale a vantaggio strutturale.",
    },
    {
      risk: "Rischio di over-reliance: processi critici dipendono da modelli AI che possono cambiare o diventare indisponibili. Servono piani di continuita' e audit periodici.",
      opportunity: "Siete posizionati per esportare il modello AI verso clienti e fornitori, generando vantaggio competitivo di ecosistema. Le aziende leader stanno gia' monetizzando l'AI come differenziatore.",
    },
  ],
  autonomia: [
    { risk: "", opportunity: "" },
    {
      risk: "Il team non ha competenze AI interne: ogni iniziativa dipende da consulenti esterni con costi non controllabili. La L.132/2025 impone obblighi formativi che, se ignorati, espongono a sanzioni.",
      opportunity: "Investire in formazione strutturata costruisce capacita' interne rapidamente. Team autonomi identificano nuovi casi d'uso dal basso, riducono la dipendenza da fornitori e attraggono talenti digitali.",
    },
    {
      risk: "Le competenze AI esistono solo in pochi individui: il rischio turnover e' critico, la conoscenza non e' distribuita. I costi di consulenza restano elevati perche' il team non gestisce in autonomia nemmeno i casi piu' semplici.",
      opportunity: "Un piano formativo mirato porta rapidamente a piena autonomia operativa. Democratizzare le competenze riduce i costi esterni e attiva un ciclo virtuoso di innovazione diffusa.",
    },
    {
      risk: "Il team gestisce l'ordinario ma non progetti AI complessi. La dipendenza da consulenti per le decisioni strategiche rimane alta e costosa. Il gap con i competitor cresce.",
      opportunity: "Pochi mesi di formazione avanzata sbloccano la capacita' di progettare soluzioni AI end-to-end internamente. Il team inizia a proporre casi d'uso autonomamente, riducendo tempi e costi.",
    },
    {
      risk: "Le competenze sono solide ma non sistematizzate: la formazione avviene in modo informale. L'autonomia resta concentrata su pochi profili senior, creando colli di bottiglia.",
      opportunity: "Strutturare un programma di AI literacy consolida il vantaggio. Un team ad alta autonomia attrae profili qualificati, riduce il time-to-market e genera innovazione senza dipendenze esterne.",
    },
    {
      risk: "Mantenere l'autonomia richiede aggiornamento continuo: senza reskilling strutturato, anche i team piu' competenti rischiano l'obsolescenza in 12-18 mesi.",
      opportunity: "L'autonomia piena e' un asset strategico differenziante: potete esportare know-how verso partner e clienti, costruire prodotti AI proprietari e posizionarvi come riferimento di settore.",
    },
  ],
  protezione: [
    { risk: "", opportunity: "" },
    {
      risk: "Dati sensibili di clienti e dipendenti vengono elaborati da tool AI pubblici senza governance. Un data breach e' probabile, con obbligo di notifica entro 72h (GDPR Art.33) e costo medio di 120-150k EUR per una PMI.",
      opportunity: "Implementare le misure minime di protezione dati AI apre l'accesso a bandi pubblici e catene di fornitura di grandi aziende che richiedono garanzie di sicurezza ai fornitori.",
    },
    {
      risk: "Policy frammentate e non applicate: i dipendenti usano AI esterne con dati aziendali senza consapevolezza dei rischi. L'esposizione a violazioni GDPR e' concreta, con sanzioni fino al 4% del fatturato.",
      opportunity: "Strutturare un data governance minimo per l'AI rafforza la fiducia di clienti e partner. La sicurezza diventa argomento commerciale, non solo tecnico.",
    },
    {
      risk: "Mancano controlli specifici per i flussi AI: dati di training, log di utilizzo e accessi non sono tracciati sistematicamente. Un incidente resta difficile da rilevare e documentare entro i termini di legge.",
      opportunity: "Completare la governance AI permette di ottenere certificazioni (ISO 27001, SOC 2) che aprono mercati enterprise e PA, dove la sicurezza e' requisito contrattuale.",
    },
    {
      risk: "L'esposizione residua riguarda scenari avanzati: attacchi adversariali, data poisoning o esfiltrazione tramite modelli AI. Le PMI in questa fascia sottovalutano i rischi specifici dell'AI.",
      opportunity: "Con pochi interventi mirati si raggiunge un livello certificabile. La sicurezza AI diventa differenziatore competitivo comunicabile a clienti e investitori.",
    },
    {
      risk: "Rischio basso e gestito. L'unica esposizione significativa e' il mantenimento: le minacce AI evolvono rapidamente e richiedono aggiornamento continuo di policy e strumenti.",
      opportunity: "L'azienda puo' posizionarsi come riferimento di settore sulla sicurezza AI, attrarre partnership strategiche e partecipare a progetti europei con standard elevati.",
    },
  ],
  tecnologia: [
    { risk: "", opportunity: "" },
    {
      risk: "I dipendenti usano account personali su strumenti AI pubblici, esponendo dati aziendali senza alcun controllo. Nessuna governance, nessun audit trail, costi frammentati e non ottimizzati.",
      opportunity: "Centralizzare l'accesso AI elimina immediatamente i rischi di data leak e permette di ottimizzare ogni euro speso. Le PMI che compiono questo passo risparmiano in media il 15-25% sui costi IT legati all'AI.",
    },
    {
      risk: "Strumenti AI attivi ma in silos, disconnessi da CRM, gestionale ed email. Il rischio e' vendor lock-in su soluzioni non integrabili e costi impossibili da ottimizzare.",
      opportunity: "Integrare gli strumenti AI con i sistemi aziendali trasforma attivita' manuali in flussi automatizzati. Una knowledge base consultabile dall'AI riduce i tempi di risposta del 30-40%.",
    },
    {
      risk: "Infrastruttura parzialmente strutturata ma senza scalabilita': crescendo, i costi aumentano in modo non lineare. Ogni nuovo caso d'uso richiede un progetto IT separato.",
      opportunity: "Con una piattaforma consolidata avete le fondamenta per automazione cross-funzionale e knowledge base condivisa. Il passo successivo abilita l'automazione end-to-end.",
    },
    {
      risk: "Infrastruttura solida ma non pienamente sfruttata: alcune integrazioni mancano e la scalabilita' non e' testata sotto carico. Il rischio e' stagnare mentre i competitor accelerano.",
      opportunity: "Siete a un passo dall'automazione avanzata: agenti AI autonomi, workflow multi-step e analisi predittiva. Investire ora consolida il vantaggio prima che diventi standard.",
    },
    {
      risk: "Un'infrastruttura eccellente oggi puo' diventare obsoleta senza ciclo di aggiornamento e revisione architetturale continuo. La governance deve evolvere con la velocita' del mercato AI.",
      opportunity: "Avete un'infrastruttura AI matura che pochi competitor italiani possono vantare. Il vostro vantaggio e' la velocita': potete testare nuovi modelli e scalare casi d'uso in settimane, non mesi.",
    },
  ],
};

/** Map a numeric score to the level index (1-5) used in AXIS_INSIGHTS */
export function getInsightIndex(score: number): number {
  if (score <= 1.4) return 1;
  if (score <= 2.4) return 2;
  if (score <= 3.4) return 3;
  if (score <= 4.4) return 4;
  return 5;
}
