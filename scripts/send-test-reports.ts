/**
 * Script: genera 10 report di esempio e li invia via API /api/send-report
 *
 * Uso: npx tsx scripts/send-test-reports.ts
 *
 * Richiede il dev server attivo su http://localhost:3000
 */

const API_URL = "http://localhost:3000/api/send-report";

interface Profile {
  nome: string;
  cognome: string;
  email: string;
  azienda: string;
  telefono: string;
  referral: string;
  settore: string;
  dipendenti: string;
  aiUsage: string;
  // Scores per axis: [conformita, processi, utilizzo, autonomia, protezione, tecnologia]
  scores: [number, number, number, number, number, number];
  description: string;
}

const PROFILES: Profile[] = [
  {
    nome: "Marco", cognome: "Bianchi", email: "digital@digitalautomations.it",
    azienda: "Meccanica Bianchi Srl", telefono: "+39 333 1111111", referral: "LinkedIn",
    settore: "Manifatturiero", dipendenti: "11-50", aiUsage: "Nessun uso",
    scores: [1, 1, 1, 1, 1, 1],
    description: "PMI manifatturiera - zero AI (tutto livello 1)",
  },
  {
    nome: "Laura", cognome: "Verdi", email: "digital@digitalautomations.it",
    azienda: "Studio Legale Verdi", telefono: "+39 333 2222222", referral: "",
    settore: "Servizi professionali", dipendenti: "1-10", aiUsage: "Uso individuale non coordinato",
    scores: [1, 1, 2, 1, 1, 2],
    description: "Studio legale piccolo - uso ChatGPT sporadico",
  },
  {
    nome: "Alessandro", cognome: "Rossi", email: "digital@digitalautomations.it",
    azienda: "Rossi Costruzioni SpA", telefono: "+39 333 3333333", referral: "Confindustria",
    settore: "Edilizia", dipendenti: "51-250", aiUsage: "Uso individuale non coordinato",
    scores: [2, 2, 2, 2, 2, 2],
    description: "Media impresa edile - consapevole ma non strutturata",
  },
  {
    nome: "Giulia", cognome: "Ferrari", email: "digital@digitalautomations.it",
    azienda: "Ferrari Consulting", telefono: "+39 333 4444444", referral: "Passaparola",
    settore: "Consulenza", dipendenti: "11-50", aiUsage: "Alcuni progetti pilota",
    scores: [2, 3, 3, 2, 2, 3],
    description: "Consulting - buon utilizzo ma compliance debole",
  },
  {
    nome: "Roberto", cognome: "Marino", email: "digital@digitalautomations.it",
    azienda: "TechFood Srl", telefono: "+39 333 5555555", referral: "",
    settore: "Food & Beverage", dipendenti: "11-50", aiUsage: "Alcuni progetti pilota",
    scores: [1, 2, 4, 3, 1, 3],
    description: "Food-tech - uso avanzato ma zero compliance e protezione",
  },
  {
    nome: "Francesca", cognome: "Colombo", email: "digital@digitalautomations.it",
    azienda: "Colombo & Partners", telefono: "+39 333 6666666", referral: "CNA",
    settore: "Commercialisti", dipendenti: "1-10", aiUsage: "Uso individuale non coordinato",
    scores: [3, 2, 2, 2, 3, 2],
    description: "Studio commercialista - compliance ok, uso basso",
  },
  {
    nome: "Paolo", cognome: "Ricci", email: "digital@digitalautomations.it",
    azienda: "Ricci Digital Agency", telefono: "+39 333 7777777", referral: "Google",
    settore: "Marketing/Digital", dipendenti: "11-50", aiUsage: "Uso diffuso e coordinato",
    scores: [2, 3, 4, 4, 2, 4],
    description: "Agenzia digitale - molto tech ma governance debole",
  },
  {
    nome: "Elena", cognome: "Moretti", email: "digital@digitalautomations.it",
    azienda: "Moretti Pharma Srl", telefono: "+39 333 8888888", referral: "Farmindustria",
    settore: "Farmaceutico", dipendenti: "51-250", aiUsage: "Alcuni progetti pilota",
    scores: [4, 3, 2, 2, 4, 2],
    description: "Pharma - compliance e protezione alta, uso e tech bassi",
  },
  {
    nome: "Luca", cognome: "Fontana", email: "digital@digitalautomations.it",
    azienda: "Fontana Logistica SpA", telefono: "+39 333 9999999", referral: "",
    settore: "Logistica", dipendenti: "51-250", aiUsage: "Uso diffuso e coordinato",
    scores: [3, 3, 3, 3, 3, 3],
    description: "Logistica media - profilo medio uniforme",
  },
  {
    nome: "Chiara", cognome: "De Luca", email: "digital@digitalautomations.it",
    azienda: "InnovaIT Srl", telefono: "+39 333 0000000", referral: "Digital Automations",
    settore: "IT/Software", dipendenti: "11-50", aiUsage: "Uso diffuso e coordinato",
    scores: [4, 4, 5, 5, 4, 5],
    description: "Software house matura - quasi eccellenza su tutto",
  },
];

const AXIS_KEYS = ["conformita", "processi", "utilizzo", "autonomia", "protezione", "tecnologia"] as const;
const AXIS_LABELS = ["Conformita' Normativa", "Governance e Processi", "Adozione e Utilizzo", "Competenze e Autonomia", "Protezione Dati", "Infrastruttura Tecnologica"];
const AXIS_FORMALS = ["Conformita' Normativa AI", "Governance e Processi AI", "Adozione e Utilizzo AI", "Competenze e Autonomia AI", "Protezione Dati AI", "Infrastruttura Tecnologica AI"];

// Question IDs per axis for compliance calculation
const QUESTION_IDS: Record<string, string[]> = {
  conformita: ["C1", "C2", "C3", "C4", "C5"],
  processi: ["G1", "G2", "G3", "G4", "G5"],
  utilizzo: ["A1", "A2", "A3", "A4", "A5"],
  autonomia: ["S1", "S2", "S3", "S4", "S5"],
  protezione: ["D1", "D2", "D3", "D4", "D5"],
  tecnologia: ["T1", "T2", "T3", "T4", "T5"],
};

function getLevel(score: number): { label: string; color: string } {
  if (score <= 1.4) return { label: "Iniziale", color: "#dc2626" };
  if (score <= 2.4) return { label: "In avvio", color: "#E09900" };
  if (score <= 3.4) return { label: "In costruzione", color: "#ca8a04" };
  if (score <= 4.4) return { label: "Operativo", color: "#16a34a" };
  return { label: "Maturo", color: "#047857" };
}

function getMessage(score: number): string {
  if (score <= 1.4) return "La tua azienda e' nella fase iniziale del percorso AI. Non hai ancora strutture, processi o tecnologia dedicata.";
  if (score <= 2.4) return "La tua azienda ha mosso i primi passi, ma senza una struttura organica. Ci sono iniziative isolate che rischiano di restare frammentate.";
  if (score <= 3.4) return "La tua azienda sta costruendo una base solida. Hai gia' fatto scelte importanti, ma servono consolidamento e integrazione.";
  if (score <= 4.4) return "La tua azienda ha un buon livello di maturita' AI. Le strutture ci sono; ora servono ottimizzazione e consolidamento.";
  return "La tua azienda e' tra le piu' avanzate nel panorama PMI italiano.";
}

function getComplianceColor(score: number): "red" | "yellow" | "green" {
  if (score < 2.0) return "red";
  if (score <= 3.0) return "yellow";
  return "green";
}

const COMPLIANCE_AREAS = [
  { name: "Registro Strumenti AI", reference: "AI Act Art. 6, GDPR Art. 6", scoreKeys: ["C2"],
    messages: { red: "Non avete un registro degli strumenti AI in uso.", yellow: "Registro incompleto.", green: "Registro presente e aggiornato." },
    action: "Compilate un registro di tutti gli strumenti AI in uso." },
  { name: "Registro Casi d'Uso e screening rischio", reference: "AI Act Art. 5-6", scoreKeys: ["C5", "A4"],
    messages: { red: "Non documentate i casi d'uso AI.", yellow: "Alcuni casi documentati, manca screening sistematico.", green: "Casi d'uso documentati con classificazione rischio." },
    action: "Documentate ogni caso d'uso AI." },
  { name: "AI Policy interna", reference: "AI Act Art. 17, 26", scoreKeys: ["G1", "G2"],
    messages: { red: "Non avete una policy sull'uso dell'AI.", yellow: "Policy presente ma non monitorata.", green: "Policy scritta, distribuita e monitorata." },
    action: "Scrivete una AI Acceptable Use Policy." },
  { name: "Informative trasparenza", reference: "L. 132/2025, AI Act Art. 50", scoreKeys: ["C3"],
    messages: { red: "Non informate che i dati vengono trattati con AI.", yellow: "Informative non specifiche per AI.", green: "Informative specifiche AI aggiornate." },
    action: "Aggiornate le informative privacy per l'AI." },
  { name: "Formazione e alfabetizzazione AI", reference: "AI Act Art. 4, L. 132/2025", scoreKeys: ["C4", "S1"],
    messages: { red: "Nessuna formazione AI erogata.", yellow: "Formazione parziale.", green: "Formazione strutturata erogata." },
    action: "Organizzate formazione AI per tutto il personale." },
  { name: "Valutazione d'impatto (DPIA)", reference: "GDPR Art. 35", scoreKeys: ["C5"],
    messages: { red: "Non fate DPIA per trattamenti AI.", yellow: "DPIA parziali.", green: "DPIA completate per tutti i trattamenti ad alto rischio." },
    action: "Completate DPIA per ogni trattamento AI con dati personali." },
  { name: "Monitoraggio e governance continua", reference: "Best practice, AI Act Art. 113", scoreKeys: ["G5", "T4"],
    messages: { red: "Non monitorate l'uso dell'AI.", yellow: "Monitoraggio basico senza processi formali.", green: "Monitoraggio attivo con gestione incidenti." },
    action: "Attivate monitoraggio regolare e processo gestione incidenti." },
];

function buildPayload(profile: Profile) {
  // Build per-question answers: all questions in an axis get the same score
  const answers: Record<string, number> = {};
  AXIS_KEYS.forEach((key, i) => {
    for (const qId of QUESTION_IDS[key]) {
      answers[qId] = profile.scores[i];
    }
  });

  const axisResults = AXIS_KEYS.map((key, i) => {
    const score = profile.scores[i];
    const { label: levelLabel, color: levelColor } = getLevel(score);
    return {
      key,
      label: AXIS_LABELS[i],
      formal: AXIS_FORMALS[i],
      score,
      levelLabel,
      levelColor,
    };
  });

  const overallScore = Math.round((profile.scores.reduce((a, b) => a + b, 0) / 6) * 10) / 10;
  const { label: overallLabel, color: overallColor } = getLevel(overallScore);

  const compliance = COMPLIANCE_AREAS.map((area) => {
    const scores = area.scoreKeys.map((k) => answers[k] ?? 1);
    const score = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
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

  return {
    lead: {
      nome: profile.nome,
      cognome: profile.cognome,
      email: profile.email,
      azienda: profile.azienda,
      telefono: profile.telefono,
      referral: profile.referral,
      consenso: true,
    },
    results: {
      contextAnswers: {
        settore: profile.settore,
        dipendenti: profile.dipendenti,
        "uso AI": profile.aiUsage,
      },
      axisResults,
      overallScore,
      overallLabel,
      overallColor,
      overallMessage: getMessage(overallScore),
      compliance,
    },
  };
}

async function main() {
  console.log("Invio 10 report di test a digital@digitalautomations.it...\n");

  for (let i = 0; i < PROFILES.length; i++) {
    const profile = PROFILES[i];
    const payload = buildPayload(profile);

    console.log(`[${i + 1}/10] ${profile.azienda} (${profile.description})`);
    console.log(`       Score: ${payload.results.overallScore}/5 - ${payload.results.overallLabel}`);
    console.log(`       Assi: ${profile.scores.join(", ")}`);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        console.log(`       ✓ Inviato\n`);
      } else {
        const err = await res.json();
        console.log(`       ✗ Errore: ${JSON.stringify(err)}\n`);
      }
    } catch (e) {
      console.log(`       ✗ Errore connessione: ${e}\n`);
    }

    // Small delay to avoid SMTP rate limiting
    if (i < PROFILES.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log("Fatto! Controlla la casella digital@digitalautomations.it");
}

main();
