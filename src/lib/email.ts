import type { LeadData, QuizResults, AxisResult, ComplianceResult } from "./types";

// --- Colors ---
const DA_NAVY = "#004172";
const DA_BLUE = "#016FC0";
const WHITE = "#ffffff";
const LIGHT_BG = "#f8fafc";
const BORDER = "#e2e8f0";
const TEXT_PRIMARY = "#1e293b";
const TEXT_SECONDARY = "#64748b";

function getLevelColor(score: number): string {
  if (score <= 1.4) return "#dc2626";
  if (score <= 2.4) return "#E09900";
  if (score <= 3.4) return "#ca8a04";
  if (score <= 4.4) return "#16a34a";
  return "#047857";
}

function getComplianceEmoji(color: string): string {
  if (color === "red") return "\u{1F534}";
  if (color === "yellow") return "\u{1F7E1}";
  return "\u{1F7E2}";
}

function barWidth(score: number): number {
  return Math.round((score / 5) * 100);
}

function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${LIGHT_BG};font-family:Arial,Helvetica,sans-serif;color:${TEXT_PRIMARY};line-height:1.6;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${LIGHT_BG};">
<tr><td align="center" style="padding:24px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
${body}
</table>
</td></tr>
</table>
</body>
</html>`;
}

function headerBlock(subtitle: string): string {
  return `<tr>
<td style="background:${DA_NAVY};padding:32px 40px;text-align:center;">
  <h1 style="margin:0 0 4px;font-size:22px;color:${WHITE};font-weight:700;">Digital Automations</h1>
  <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.8);">${subtitle}</p>
</td>
</tr>`;
}

function footerBlock(): string {
  return `<tr>
<td style="background:${LIGHT_BG};padding:24px 40px;text-align:center;font-size:12px;color:${TEXT_SECONDARY};border-top:1px solid ${BORDER};">
  <p style="margin:0 0 4px;"><strong>Digital Automations</strong></p>
  <p style="margin:0 0 4px;">digital@digitalautomations.it</p>
  <p style="margin:0;">
    <a href="https://digitalautomations.it" style="color:${DA_BLUE};text-decoration:none;">digitalautomations.it</a>
  </p>
</td>
</tr>`;
}

function scoreBar(score: number, label: string, name: string): string {
  const color = getLevelColor(score);
  const width = barWidth(score);
  return `<tr>
<td style="padding:6px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="160" style="font-size:13px;color:${TEXT_PRIMARY};padding-right:12px;">${name}</td>
    <td>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e2e8f0;border-radius:4px;overflow:hidden;">
      <tr><td style="width:${width}%;background:${color};height:18px;border-radius:4px;"></td><td></td></tr>
      </table>
    </td>
    <td width="90" style="text-align:right;font-size:13px;color:${TEXT_SECONDARY};padding-left:8px;">${score.toFixed(1)}/5 &middot; ${label}</td>
  </tr>
  </table>
</td>
</tr>`;
}

// -------------------------------------------------
// PUBLIC: lead-facing email
// -------------------------------------------------
export function buildLeadEmail(
  lead: LeadData,
  results: QuizResults
): { subject: string; html: string } {
  const subject = `Il tuo report AI Readiness - Digital Automations`;

  const overallColor = getLevelColor(results.overallScore);

  const axisRows = results.axisResults
    .map((a: AxisResult) => scoreBar(a.score, a.levelLabel, a.label))
    .join("");

  const complianceRows = results.compliance
    .map(
      (c: ComplianceResult) =>
        `<tr>
  <td style="padding:8px 0;border-bottom:1px solid ${BORDER};font-size:13px;">
    ${getComplianceEmoji(c.color)} <strong>${c.name}</strong><br/>
    <span style="color:${TEXT_SECONDARY};font-size:12px;">${c.message}</span>
  </td>
</tr>`
    )
    .join("");

  const body = `
${headerBlock("AI Readiness Assessment")}
<tr><td style="padding:32px 40px;">
  <p style="margin:0 0 16px;font-size:16px;">Ciao <strong>${lead.nome}</strong>,</p>
  <p style="margin:0 0 24px;font-size:14px;color:${TEXT_SECONDARY};">
    Grazie per aver completato il questionario AI Readiness. Ecco il tuo report personalizzato.
  </p>

  <!-- Overall score badge -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
  <tr><td align="center">
    <table cellpadding="0" cellspacing="0" border="0" style="background:${overallColor};border-radius:12px;overflow:hidden;">
    <tr><td style="padding:20px 40px;text-align:center;">
      <p style="margin:0 0 2px;font-size:36px;font-weight:700;color:${WHITE};">${results.overallScore.toFixed(1)}<span style="font-size:18px;font-weight:400;"> / 5.0</span></p>
      <p style="margin:0;font-size:16px;color:rgba(255,255,255,0.9);">${results.overallLabel}</p>
    </td></tr>
    </table>
  </td></tr>
  </table>

  <p style="margin:0 0 24px;font-size:14px;color:${TEXT_SECONDARY};">${results.overallMessage}</p>

  <!-- Axis scores -->
  <h2 style="margin:0 0 12px;font-size:16px;color:${DA_NAVY};">Punteggio per asse</h2>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
  ${axisRows}
  </table>

  <!-- Compliance -->
  <h2 style="margin:0 0 12px;font-size:16px;color:${DA_NAVY};">Compliance Snapshot</h2>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
  ${complianceRows}
  </table>

  <!-- CTA -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td align="center" style="padding:8px 0 0;">
    <a href="https://digitalautomations.it" style="display:inline-block;background:${DA_BLUE};color:${WHITE};text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;font-weight:600;">
      Prenota una call con un consulente
    </a>
  </td></tr>
  </table>
</td></tr>
${footerBlock()}`;

  return { subject, html: wrapHtml("AI Readiness Report", body) };
}

// -------------------------------------------------
// PUBLIC: internal notification email
// -------------------------------------------------
export function buildInternalEmail(
  lead: LeadData,
  results: QuizResults
): { subject: string; html: string } {
  const subject = `Nuovo lead AI Assessment: ${lead.azienda} - ${lead.nome} ${lead.cognome}`;

  const contextSection = Object.entries(results.contextAnswers)
    .map(
      ([key, value]) =>
        `<tr>
  <td style="padding:4px 8px;font-size:13px;color:${TEXT_SECONDARY};border-bottom:1px solid ${BORDER};">${key}</td>
  <td style="padding:4px 8px;font-size:13px;border-bottom:1px solid ${BORDER};">${value}</td>
</tr>`
    )
    .join("");

  const axisSection = results.axisResults
    .map(
      (a: AxisResult) =>
        `<tr>
  <td style="padding:4px 8px;font-size:13px;border-bottom:1px solid ${BORDER};">${a.label}</td>
  <td style="padding:4px 8px;font-size:13px;border-bottom:1px solid ${BORDER};text-align:center;">${a.score.toFixed(1)}</td>
  <td style="padding:4px 8px;font-size:13px;border-bottom:1px solid ${BORDER};">${a.levelLabel}</td>
</tr>`
    )
    .join("");

  const complianceSection = results.compliance
    .map(
      (c: ComplianceResult) =>
        `<tr>
  <td style="padding:4px 8px;font-size:13px;border-bottom:1px solid ${BORDER};">${getComplianceEmoji(c.color)} ${c.name}</td>
  <td style="padding:4px 8px;font-size:13px;border-bottom:1px solid ${BORDER};">${c.message}</td>
</tr>`
    )
    .join("");

  const sector = results.contextAnswers["settore"] ?? results.contextAnswers["Settore"] ?? "-";
  const employees = results.contextAnswers["dipendenti"] ?? results.contextAnswers["Dipendenti"] ?? "-";

  const body = `
${headerBlock("Notifica Interno - Nuovo Lead")}
<tr><td style="padding:32px 40px;">

  <!-- Quick summary -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${LIGHT_BG};border:1px solid ${BORDER};border-radius:6px;margin-bottom:24px;">
  <tr><td style="padding:16px 20px;font-size:14px;">
    <strong>Punteggio:</strong> ${results.overallScore.toFixed(1)}/5 (${results.overallLabel}) &mdash; ${sector} &mdash; ${employees} dipendenti
  </td></tr>
  </table>

  <!-- Lead data -->
  <h2 style="margin:0 0 8px;font-size:15px;color:${DA_NAVY};">Dati Lead</h2>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
    <tr><td style="padding:4px 8px;font-size:13px;color:${TEXT_SECONDARY};width:120px;">Nome</td><td style="padding:4px 8px;font-size:13px;">${lead.nome} ${lead.cognome}</td></tr>
    <tr><td style="padding:4px 8px;font-size:13px;color:${TEXT_SECONDARY};">Email</td><td style="padding:4px 8px;font-size:13px;"><a href="mailto:${lead.email}" style="color:${DA_BLUE};">${lead.email}</a></td></tr>
    <tr><td style="padding:4px 8px;font-size:13px;color:${TEXT_SECONDARY};">Azienda</td><td style="padding:4px 8px;font-size:13px;">${lead.azienda}</td></tr>
    <tr><td style="padding:4px 8px;font-size:13px;color:${TEXT_SECONDARY};">Telefono</td><td style="padding:4px 8px;font-size:13px;">${lead.telefono}</td></tr>
  </table>

  <!-- Context answers -->
  <h2 style="margin:0 0 8px;font-size:15px;color:${DA_NAVY};">Risposte Contesto</h2>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  ${contextSection}
  </table>

  <!-- Axis scores -->
  <h2 style="margin:0 0 8px;font-size:15px;color:${DA_NAVY};">Punteggi per Asse</h2>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
    <tr style="background:${DA_NAVY};color:${WHITE};">
      <th style="padding:6px 8px;font-size:12px;text-align:left;">Asse</th>
      <th style="padding:6px 8px;font-size:12px;text-align:center;">Score</th>
      <th style="padding:6px 8px;font-size:12px;text-align:left;">Livello</th>
    </tr>
    ${axisSection}
    <tr style="background:${LIGHT_BG};font-weight:700;">
      <td style="padding:6px 8px;font-size:13px;">Overall</td>
      <td style="padding:6px 8px;font-size:13px;text-align:center;">${results.overallScore.toFixed(1)}</td>
      <td style="padding:6px 8px;font-size:13px;">${results.overallLabel}</td>
    </tr>
  </table>

  <!-- Compliance -->
  <h2 style="margin:0 0 8px;font-size:15px;color:${DA_NAVY};">Compliance</h2>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
    <tr style="background:${DA_NAVY};color:${WHITE};">
      <th style="padding:6px 8px;font-size:12px;text-align:left;">Area</th>
      <th style="padding:6px 8px;font-size:12px;text-align:left;">Stato</th>
    </tr>
    ${complianceSection}
  </table>

</td></tr>
${footerBlock()}`;

  return { subject, html: wrapHtml("Nuovo Lead AI Assessment", body) };
}
