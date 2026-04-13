import type { AxisResult, ComplianceResult, AxisKey } from "./types";

const LEVEL_THRESHOLDS: {
  max: number;
  label: string;
  color: string;
}[] = [
  { max: 1.4, label: "Iniziale", color: "#dc2626" },
  { max: 2.4, label: "In avvio", color: "#E09900" },
  { max: 3.4, label: "In costruzione", color: "#ca8a04" },
  { max: 4.4, label: "Operativo", color: "#16a34a" },
  { max: 5.0, label: "Maturo", color: "#047857" },
];

const MESSAGES: Record<string, string> = {
  "1.0-1.4":
    "La tua azienda è nella fase iniziale del percorso AI. Non hai ancora strutture, processi o tecnologia dedicata. È la condizione della maggior parte delle PMI italiane: il momento giusto per partire con un approccio strutturato è adesso.",
  "1.5-2.4":
    "La tua azienda ha mosso i primi passi, ma senza una struttura organica. Ci sono iniziative isolate che rischiano di restare frammentate. Un programma strutturato può trasformare queste iniziative in un sistema governato.",
  "2.5-3.4":
    "La tua azienda sta costruendo una base solida. Hai già fatto scelte importanti, ma servono consolidamento e integrazione per passare dalla sperimentazione all'operatività.",
  "3.5-4.4":
    "La tua azienda ha un buon livello di maturità AI. Le strutture ci sono; ora servono ottimizzazione, integrazione avanzata e consolidamento della governance.",
  "4.5-5.0":
    "La tua azienda è tra le più avanzate nel panorama PMI italiano. Continua a investire in revisione periodica e innovazione.",
};

export function getLevel(score: number): {
  label: string;
  color: string;
} {
  for (const t of LEVEL_THRESHOLDS) {
    if (score <= t.max) return { label: t.label, color: t.color };
  }
  return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

export function getMessage(score: number): string {
  if (score <= 1.4) return MESSAGES["1.0-1.4"];
  if (score <= 2.4) return MESSAGES["1.5-2.4"];
  if (score <= 3.4) return MESSAGES["2.5-3.4"];
  if (score <= 4.4) return MESSAGES["3.5-4.4"];
  return MESSAGES["4.5-5.0"];
}

export function calculateAxisScore(answers: number[]): number {
  const sum = answers.reduce((a, b) => a + b, 0);
  return Math.round((sum / answers.length) * 10) / 10;
}

export function calculateResults(
  answers: Record<string, number>,
  contextAnswers: Record<string, string>,
  axes: { key: AxisKey; label: string; formal: string; questions: { id: string }[] }[]
): {
  axisResults: AxisResult[];
  overallScore: number;
  overallLabel: string;
  overallColor: string;
  overallMessage: string;
  compliance: ComplianceResult[];
} {
  const axisResults: AxisResult[] = axes.map((axis) => {
    const scores = axis.questions.map((q) => answers[q.id] ?? 1);
    const score = calculateAxisScore(scores);
    const { label: levelLabel, color: levelColor } = getLevel(score);
    return {
      key: axis.key,
      label: axis.label,
      formal: axis.formal,
      score,
      levelLabel,
      levelColor,
    };
  });

  const overallScore =
    Math.round(
      (axisResults.reduce((s, a) => s + a.score, 0) / axisResults.length) * 10
    ) / 10;
  const { label: overallLabel, color: overallColor } = getLevel(overallScore);
  const overallMessage = getMessage(overallScore);

  const compliance = calculateCompliance(answers);

  return {
    axisResults,
    overallScore,
    overallLabel,
    overallColor,
    overallMessage,
    compliance,
  };
}

function getComplianceColor(
  score: number
): "red" | "yellow" | "green" {
  if (score < 2.0) return "red";
  if (score <= 3.0) return "yellow";
  return "green";
}

interface ComplianceAreaDef {
  name: string;
  reference: string;
  scoreKeys: string[];
  messages: { red: string; yellow: string; green: string };
  action: string;
}

const COMPLIANCE_AREAS: ComplianceAreaDef[] = [
  {
    name: "Registro Strumenti AI",
    reference: "AI Act Art. 6, GDPR Art. 6",
    scoreKeys: ["C2"],
    messages: {
      red: "Non avete un registro degli strumenti AI in uso. È il primo passo per la conformità.",
      yellow:
        "Avete iniziato a catalogare gli strumenti, ma il registro è incompleto o non include la classificazione del rischio.",
      green:
        "Registro presente e aggiornato. Verificate che includa la classificazione rischio per ogni strumento.",
    },
    action:
      "Compilate un registro di tutti gli strumenti AI in uso con: nome, reparto, dati trattati, livello di rischio.",
  },
  {
    name: "Registro Casi d'Uso e screening rischio",
    reference: "AI Act Art. 5-6, Art. 26(2)",
    scoreKeys: ["C5", "A4"],
    messages: {
      red: "Non documentate i casi d'uso AI nè verificate se rientrano in pratiche ad alto rischio o vietate.",
      yellow:
        "Alcuni casi d'uso sono documentati, ma manca una verifica sistematica del livello di rischio.",
      green:
        "Casi d'uso documentati con classificazione rischio. Screening pratiche vietate completato.",
    },
    action:
      "Documentate ogni caso d'uso AI con: finalità, dati coinvolti, livello di rischio, supervisore umano.",
  },
  {
    name: "AI Policy interna",
    reference: "AI Act Art. 17, 26",
    scoreKeys: ["G1", "G2"],
    messages: {
      red: "Non avete una policy scritta sull'uso dell'AI. I dipendenti non hanno regole chiare.",
      yellow:
        "Avete una policy, ma non è firmata da tutti o non viene monitorata l'aderenza.",
      green:
        "Policy scritta, distribuita, firmata e monitorata. Processo di approvazione nuovi strumenti attivo.",
    },
    action:
      "Scrivete una AI Acceptable Use Policy e fatela firmare a tutti i dipendenti coinvolti.",
  },
  {
    name: "Informative trasparenza",
    reference: "L. 132/2025, AI Act Art. 50, GDPR Art. 13-14",
    scoreKeys: ["C3"],
    messages: {
      red: "Non informate dipendenti, clienti o fornitori che i loro dati vengono trattati con AI.",
      yellow:
        "Le informative privacy esistono ma non sono specifiche per i trattamenti AI.",
      green:
        "Informative specifiche per l'AI aggiornate per tutti i soggetti coinvolti.",
    },
    action:
      "Aggiornate le informative privacy per includere specificamente i trattamenti effettuati con AI.",
  },
  {
    name: "Formazione e alfabetizzazione AI",
    reference: "AI Act Art. 4, L. 132/2025 Art. 24",
    scoreKeys: ["C4", "S1"],
    messages: {
      red: "Nessuna formazione AI erogata. Il team non conosce rischi e obblighi.",
      yellow:
        "Formazione avviata ma parziale: non copre ancora tutto il personale coinvolto.",
      green:
        "Formazione strutturata erogata. Il team conosce rischi, obblighi e utilizzo corretto.",
    },
    action:
      "Organizzate formazione su rischi AI, obblighi normativi e utilizzo corretto per tutto il personale coinvolto.",
  },
  {
    name: "Valutazione d'impatto (DPIA)",
    reference: "GDPR Art. 35",
    scoreKeys: ["C5"],
    messages: {
      red: "Non fate valutazioni d'impatto per i trattamenti AI che coinvolgono dati personali.",
      yellow:
        "Avete fatto qualche valutazione, ma non per tutti i trattamenti ad alto rischio.",
      green:
        "DPIA completate per tutti i trattamenti AI ad alto rischio. Procedura formalizzata.",
    },
    action:
      "Completate una valutazione d'impatto scritta per ogni trattamento AI che coinvolge dati personali su larga scala.",
  },
  {
    name: "Monitoraggio e governance continua",
    reference: "Best practice, AI Act Art. 113",
    scoreKeys: ["G5", "T4"],
    messages: {
      red: "Non monitorate l'uso dell'AI nè avete processi per gestire problemi.",
      yellow:
        "Monitoraggio basico presente ma senza processi formali per incidenti.",
      green:
        "Monitoraggio attivo con processo di gestione incidenti e revisione periodica.",
    },
    action:
      "Attivate un monitoraggio regolare dell'uso AI e definite un processo per gestire violazioni e incidenti.",
  },
];

function calculateCompliance(
  answers: Record<string, number>
): ComplianceResult[] {
  return COMPLIANCE_AREAS.map((area) => {
    const scores = area.scoreKeys.map((k) => answers[k] ?? 1);
    const score =
      Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) /
      10;
    const color = getComplianceColor(score);
    return {
      name: area.name,
      reference: area.reference,
      score,
      color,
      message: area.messages[color],
      action: area.action,
    };
  });
}

// Minimum target floors — target is always max(floor, score + 1), capped at 5
export const TARGET_FLOORS: Record<AxisKey, number> = {
  conformita: 4.5,
  processi: 4.0,
  utilizzo: 3.0,
  autonomia: 3.8,
  protezione: 4.5,
  tecnologia: 3.5,
};

export function getTargetScore(axisKey: AxisKey, currentScore: number): number {
  const floor = TARGET_FLOORS[axisKey];
  return Math.min(Math.max(floor, currentScore + 1), 5);
}

// Static reference kept for backward compatibility
export const AFTER_TARGETS: Record<AxisKey, { score: number; label: string }> =
  {
    conformita: { score: 4.5, label: "Operativa" },
    processi: { score: 4.0, label: "Applicata" },
    utilizzo: { score: 3.0, label: "Strutturata" },
    autonomia: { score: 3.8, label: "Autonomia" },
    protezione: { score: 4.5, label: "Protetta" },
    tecnologia: { score: 3.5, label: "Base" },
  };

export const LEVEL_LABELS: Record<AxisKey, string[]> = {
  conformita: [
    "",
    "Assente",
    "Consapevole",
    "In costruzione",
    "Operativa",
    "Matura",
  ],
  processi: [
    "",
    "Assente",
    "Informale",
    "Documentata",
    "Applicata",
    "Integrata",
  ],
  utilizzo: [
    "",
    "Nulla",
    "Sperimentale",
    "Strutturata",
    "Diffusa",
    "Pervasiva",
  ],
  autonomia: [
    "",
    "Assenti",
    "Literacy base",
    "Formazione",
    "Autonomia",
    "Eccellenza",
  ],
  protezione: [
    "",
    "Esposta",
    "Consapevole",
    "Controllata",
    "Protetta",
    "Matura",
  ],
  tecnologia: [
    "",
    "Assente",
    "Minima",
    "Base",
    "Integrata",
    "Avanzata",
  ],
};

export const LEVEL_DETAILS: Record<AxisKey, string[]> = {
  conformita: [
    "",
    "Nessun documento di conformità AI. Nessun registro, nessuna DPIA, nessuna informativa aggiornata.",
    "Il management sa che esistono AI Act e Legge 132/2025 ma non ha intrapreso azioni concrete.",
    "Registro AI avviato. Almeno 1 DPIA completata. Informative aggiornate per i trattamenti principali.",
    "Registro completo e aggiornato. DPIA per tutti i trattamenti ad alto rischio. Piano formativo L.132 in esecuzione.",
    "Revisione periodica. Procedura per nuovi strumenti. Audit completato. 100% personale formato.",
  ],
  processi: [
    "",
    "Nessuna regola sull'uso AI. Ogni dipendente decide autonomamente.",
    "Indicazioni verbali ma niente di scritto. Nessun processo strutturato.",
    "Policy d'Uso AI (AUP) scritta e distribuita. Ruoli definiti.",
    "AUP firmata da tutti. Processo approvazione operativo. Monitoraggio uso attivo.",
    "Processi AI integrati nei processi aziendali. Revisione annuale. Metriche tracciate.",
  ],
  utilizzo: [
    "",
    "0-5% dipendenti usa AI, solo per curiosità personale. Nessun agente operativo.",
    "5-15% usa AI senza coordinamento. 1-2 casi d'uso informali.",
    "15-30% usa AI in modo coordinato. 2-3 casi d'uso definiti. 1-3 agenti operativi.",
    "30-60% usa AI regolarmente. 4-6 agenti in 2+ reparti. KPI tracciati.",
    ">60% usa AI quotidianamente. 7+ agenti in 3+ reparti. Impatto misurato.",
  ],
  autonomia: [
    "",
    "Nessuna formazione AI. Il team non sa cos'è un prompt o un agente.",
    "Formazione non strutturata. Management con idea generica dell'AI.",
    "Management formato su governance. 2-3 AI Champions operativi. Team introdotto.",
    "Champions autonomi. Management integra AI nelle decisioni. Team usa strumenti senza assistenza.",
    "Champions formano colleghi. Management valuta nuovi strumenti. Cultura AI integrata.",
  ],
  protezione: [
    "",
    "Tool AI pubblici con dati aziendali senza controllo. Shadow AI diffusa.",
    "Rischio riconosciuto ma nessuna contromisura implementata.",
    "Piattaforma AI aziendale disponibile. Classificazione dati base. Accessi gestiti.",
    "Piattaforma privata operativa. Role-based access. Log attivi. Shadow AI sotto controllo.",
    "Audit periodico. Incident response specifico. Penetration test. Encryption verificata.",
  ],
  tecnologia: [
    "",
    "Nessuna piattaforma AI aziendale. Account personali su tool pubblici.",
    "Abbonamenti individuali (es. ChatGPT Plus per 2-3 persone). Nessuna piattaforma.",
    "Piattaforma AI aziendale installata. 1-3 agenti configurati. Gestione utenti.",
    "4-6 agenti attivi. Almeno 1 integrazione con sistemi aziendali. Multi-modello.",
    "7+ agenti. 2+ integrazioni. Knowledge base connesse. Pipeline dati strutturate.",
  ],
};
