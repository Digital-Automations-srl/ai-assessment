import { useState, useMemo } from "react";

const DA_COLORS = {
  navy: "#004172",
  blue: "#016FC0",
  lightGray: "#E4E4E4",
  white: "#FFFFFF",
  amber: "#E09900",
};

/* Ordine: senso orario da ore 12 (top)
 * Decisione CEO 13/04/2026: label = solo italiano nel grafico.
 * Terminologia formale in legenda separata (versione D, primaria)
 * o come seconda riga sotto la label (versione B, fallback per contesti senza spazio legenda).
 */
const AXES = [
  { key: "conformita", label: "Conformità", formal: "Compliance" },
  { key: "processi", label: "Processi e Controlli", formal: "Governance" },
  { key: "utilizzo", label: "Utilizzo Reale", formal: "Adoption" },
  { key: "autonomia", label: "Autonomia Team", formal: "AI Skills" },
  { key: "protezione", label: "Protezione Dati", formal: "Data Security" },
  { key: "tecnologia", label: "Tecnologia", formal: "Technology" },
];

const BEFORE_PROFILE = {
  conformita: 1.0,
  processi: 1.0,
  utilizzo: 1.5,
  autonomia: 1.0,
  protezione: 1.5,
  tecnologia: 1.0,
};

const AFTER_PROFILE = {
  conformita: 3.5,
  processi: 4.0,
  utilizzo: 3.0,
  autonomia: 3.5,
  protezione: 4.0,
  tecnologia: 4.0,
};

const LEVEL_LABELS = {
  conformita: ["", "Assente", "Consapevole", "In costruzione", "Operativa", "Matura"],
  processi: ["", "Assente", "Informale", "Documentata", "Applicata", "Integrata"],
  utilizzo: ["", "Nulla", "Sperimentale", "Strutturata", "Diffusa", "Pervasiva"],
  autonomia: ["", "Assenti", "Literacy base", "Formazione", "Autonomia", "Eccellenza"],
  protezione: ["", "Esposta", "Consapevole", "Controllata", "Protetta", "Matura"],
  tecnologia: ["", "Assente", "Minima", "Base", "Integrata", "Avanzata"],
};

const LEVEL_DETAILS = {
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

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function buildPolygonPoints(cx, cy, radius, values, maxVal, count) {
  return values
    .map((v, i) => {
      const angle = (360 / count) * i;
      const r = (v / maxVal) * radius;
      const pt = polarToCartesian(cx, cy, r, angle);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");
}

function SpiderChart({ beforeData, afterData, showBefore, showAfter, size = 420 }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const maxVal = 5;
  const count = AXES.length;

  const gridLevels = [1, 2, 3, 4, 5];

  const gridPolygons = gridLevels.map((level) => {
    const pts = Array.from({ length: count }, (_, i) => {
      const angle = (360 / count) * i;
      const r = (level / maxVal) * radius;
      return polarToCartesian(cx, cy, r, angle);
    });
    return pts.map((p) => `${p.x},${p.y}`).join(" ");
  });

  const axisLines = Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i;
    const end = polarToCartesian(cx, cy, radius, angle);
    return { x1: cx, y1: cy, x2: end.x, y2: end.y };
  });

  const labelPositions = AXES.map((axis, i) => {
    const angle = (360 / count) * i;
    const pt = polarToCartesian(cx, cy, radius + 32, angle);
    return { ...pt, label: axis.label };
  });

  const levelLabelPositions = gridLevels.map((level) => {
    const r = (level / maxVal) * radius;
    const pt = polarToCartesian(cx, cy, r, 0);
    return { x: pt.x + 6, y: pt.y - 4, level };
  });

  const beforeValues = AXES.map((a) => beforeData[a.key]);
  const afterValues = AXES.map((a) => afterData[a.key]);

  const beforePoly = buildPolygonPoints(cx, cy, radius, beforeValues, maxVal, count);
  const afterPoly = buildPolygonPoints(cx, cy, radius, afterValues, maxVal, count);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }}>
      {gridPolygons.map((pts, idx) => (
        <polygon key={idx} points={pts} fill="none" stroke={DA_COLORS.lightGray} strokeWidth={idx === gridPolygons.length - 1 ? 1.5 : 0.7} />
      ))}
      {axisLines.map((line, idx) => (
        <line key={idx} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={DA_COLORS.lightGray} strokeWidth={0.7} />
      ))}
      {levelLabelPositions.map((lp, idx) => (
        <text key={idx} x={lp.x} y={lp.y} fontSize="10" fill="#999" textAnchor="start" dominantBaseline="middle">{lp.level}</text>
      ))}
      {showBefore && (
        <polygon points={beforePoly} fill={DA_COLORS.amber} fillOpacity={0.18} stroke={DA_COLORS.amber} strokeWidth={2.2} strokeLinejoin="round" />
      )}
      {showAfter && (
        <polygon points={afterPoly} fill={DA_COLORS.blue} fillOpacity={0.15} stroke={DA_COLORS.blue} strokeWidth={2.2} strokeLinejoin="round" />
      )}
      {showBefore && beforeValues.map((v, i) => {
        const angle = (360 / count) * i;
        const r = (v / maxVal) * radius;
        const pt = polarToCartesian(cx, cy, r, angle);
        return <circle key={`b-${i}`} cx={pt.x} cy={pt.y} r={4} fill={DA_COLORS.amber} stroke={DA_COLORS.white} strokeWidth={1.5} />;
      })}
      {showAfter && afterValues.map((v, i) => {
        const angle = (360 / count) * i;
        const r = (v / maxVal) * radius;
        const pt = polarToCartesian(cx, cy, r, angle);
        return <circle key={`a-${i}`} cx={pt.x} cy={pt.y} r={4} fill={DA_COLORS.blue} stroke={DA_COLORS.white} strokeWidth={1.5} />;
      })}
      {labelPositions.map((lp, idx) => {
        const isTop = lp.y < cy - radius * 0.5;
        const isBottom = lp.y > cy + radius * 0.5;
        const anchor = Math.abs(lp.x - cx) < 10 ? "middle" : lp.x < cx ? "end" : "start";
        return (
          <text key={idx} x={lp.x} y={lp.y + (isTop ? -4 : isBottom ? 10 : 0)} fontSize="13" fontWeight="600" fill={DA_COLORS.navy} textAnchor={anchor} dominantBaseline="middle">
            {lp.label}
          </text>
        );
      })}
    </svg>
  );
}

function ScoreBar({ label, before, after, axisKey, onSelect, isSelected }) {
  const delta = after - before;
  return (
    <button
      onClick={() => onSelect(axisKey)}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 8,
        border: isSelected ? `2px solid ${DA_COLORS.blue}` : "2px solid transparent",
        background: isSelected ? "#f0f7ff" : "transparent", cursor: "pointer", width: "100%", textAlign: "left", transition: "all 0.15s",
      }}
    >
      <div style={{ minWidth: 130, fontWeight: 600, fontSize: 13, color: DA_COLORS.navy }}>{label}</div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: DA_COLORS.amber + "22", borderRadius: 4, padding: "2px 8px" }}>
          <span style={{ fontSize: 12, color: DA_COLORS.amber, fontWeight: 700 }}>{before.toFixed(1)}</span>
        </div>
        <div style={{ fontSize: 14, color: "#999" }}>&rarr;</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: DA_COLORS.blue + "22", borderRadius: 4, padding: "2px 8px" }}>
          <span style={{ fontSize: 12, color: DA_COLORS.blue, fontWeight: 700 }}>{after.toFixed(1)}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a" }}>+{delta.toFixed(1)}</span>
      </div>
    </button>
  );
}

function DetailPanel({ axisKey }) {
  if (!axisKey) return null;
  const axis = AXES.find((a) => a.key === axisKey);
  const labels = LEVEL_LABELS[axisKey];
  const details = LEVEL_DETAILS[axisKey];
  const before = BEFORE_PROFILE[axisKey];
  const after = AFTER_PROFILE[axisKey];

  return (
    <div style={{ background: "#fafbfc", borderRadius: 10, padding: "16px 20px", marginTop: 12, border: `1px solid ${DA_COLORS.lightGray}` }}>
      <h4 style={{ margin: "0 0 12px", color: DA_COLORS.navy, fontSize: 15 }}>
        {axis.label}: dettaglio livelli
      </h4>
      {[1, 2, 3, 4, 5].map((level) => {
        const isBefore = Math.round(before) === level;
        const isAfter = Math.round(after) === level;
        return (
          <div key={level} style={{
            display: "flex", gap: 10, padding: "8px 10px", borderRadius: 6, marginBottom: 4,
            background: isAfter ? DA_COLORS.blue + "12" : isBefore ? DA_COLORS.amber + "15" : "transparent",
            borderLeft: isAfter ? `3px solid ${DA_COLORS.blue}` : isBefore ? `3px solid ${DA_COLORS.amber}` : "3px solid transparent",
          }}>
            <div style={{
              minWidth: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700,
              background: isAfter ? DA_COLORS.blue : isBefore ? DA_COLORS.amber : DA_COLORS.lightGray,
              color: isAfter || isBefore ? DA_COLORS.white : "#666",
            }}>{level}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: DA_COLORS.navy }}>
                {labels[level]}
                {isBefore && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: DA_COLORS.amber, background: DA_COLORS.amber + "18", padding: "1px 6px", borderRadius: 4 }}>BEFORE</span>}
                {isAfter && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: DA_COLORS.blue, background: DA_COLORS.blue + "18", padding: "1px 6px", borderRadius: 4 }}>AFTER</span>}
              </div>
              <div style={{ fontSize: 12, color: "#555", lineHeight: 1.45, marginTop: 2 }}>{details[level]}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AIReadinessSpider() {
  const [showBefore, setShowBefore] = useState(true);
  const [showAfter, setShowAfter] = useState(true);
  const [selectedAxis, setSelectedAxis] = useState(null);

  const avgBefore = useMemo(() => AXES.reduce((s, a) => s + BEFORE_PROFILE[a.key], 0) / AXES.length, []);
  const avgAfter = useMemo(() => AXES.reduce((s, a) => s + AFTER_PROFILE[a.key], 0) / AXES.length, []);

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif", maxWidth: 900, margin: "0 auto", padding: 24, color: "#333" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: DA_COLORS.navy, margin: "0 0 4px" }}>AI Readiness Assessment</h1>
        <p style={{ fontSize: 14, color: "#666", margin: 0 }}>AI Starter Program DA: da zero all'AI governata in 90 giorni</p>
      </div>

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 380px", minWidth: 300 }}>
          <SpiderChart beforeData={BEFORE_PROFILE} afterData={AFTER_PROFILE} showBefore={showBefore} showAfter={showAfter} />
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              <input type="checkbox" checked={showBefore} onChange={() => setShowBefore(!showBefore)} style={{ accentColor: DA_COLORS.amber }} />
              <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 3, background: DA_COLORS.amber, marginRight: 2 }} />
              <span style={{ color: DA_COLORS.amber }}>Before (PMI tipo)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              <input type="checkbox" checked={showAfter} onChange={() => setShowAfter(!showAfter)} style={{ accentColor: DA_COLORS.blue }} />
              <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 3, background: DA_COLORS.blue, marginRight: 2 }} />
              <span style={{ color: DA_COLORS.blue }}>After (post 90gg)</span>
            </label>
          </div>
        </div>

        <div style={{ flex: "1 1 360px", minWidth: 300 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, textAlign: "center", padding: "12px 8px", borderRadius: 10, background: DA_COLORS.amber + "12", border: `1px solid ${DA_COLORS.amber}33` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: DA_COLORS.amber, textTransform: "uppercase", letterSpacing: 0.5 }}>Before</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: DA_COLORS.amber }}>{avgBefore.toFixed(1)}</div>
              <div style={{ fontSize: 11, color: "#999" }}>media / 5.0</div>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "12px 8px", borderRadius: 10, background: DA_COLORS.blue + "12", border: `1px solid ${DA_COLORS.blue}33` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: DA_COLORS.blue, textTransform: "uppercase", letterSpacing: 0.5 }}>After</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: DA_COLORS.blue }}>{avgAfter.toFixed(1)}</div>
              <div style={{ fontSize: 11, color: "#999" }}>media / 5.0</div>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "12px 8px", borderRadius: 10, background: "#dcfce7", border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", textTransform: "uppercase", letterSpacing: 0.5 }}>Delta</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#16a34a" }}>+{(avgAfter - avgBefore).toFixed(1)}</div>
              <div style={{ fontSize: 11, color: "#999" }}>in 90 giorni</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {AXES.map((axis) => (
              <ScoreBar key={axis.key} label={axis.label} before={BEFORE_PROFILE[axis.key]} after={AFTER_PROFILE[axis.key]} axisKey={axis.key} onSelect={setSelectedAxis} isSelected={selectedAxis === axis.key} />
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#999", marginTop: 12, lineHeight: 1.5 }}>
            Clicca su un asse per vedere il dettaglio dei 5 livelli. I punteggi "before" rappresentano una PMI tipo 10-250 dipendenti che non ha mai strutturato l'AI. I punteggi "after" sono i target realistici a fine AI Starter Program (90 giorni, variante Standard).
          </p>
        </div>
      </div>

      <DetailPanel axisKey={selectedAxis} />

      {/* Legenda terminologica internazionale (versione D) */}
      <div style={{ marginTop: 20, padding: "14px 20px", background: "#f8f9fa", borderRadius: 8, border: "1px solid #d1d5db" }}>
        <div style={{ fontWeight: 700, fontSize: 12, color: DA_COLORS.navy, marginBottom: 8 }}>
          Terminologia Internazionale di Riferimento
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px" }}>
          {AXES.map((axis) => (
            <div key={axis.key} style={{ fontSize: 12, color: "#555" }}>
              <span style={{ color: DA_COLORS.navy }}>{axis.label}</span>
              <span style={{ color: DA_COLORS.blue, marginLeft: 6 }}>→ {axis.formal}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${DA_COLORS.lightGray}`, textAlign: "center", fontSize: 11, color: "#999" }}>
        Digital Automations: AI Starter Program Assessment Framework v3.0
      </div>
    </div>
  );
}
