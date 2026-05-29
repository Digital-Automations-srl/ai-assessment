import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import sharp from "sharp";
import { buildLeadEmail, buildInternalEmail } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildSubmissionFields, type QuizAnswerMap } from "@/lib/submission-record";
import { generateSpiderChartSVG } from "@/lib/spider-chart-svg";
import { getTargetScore } from "@/lib/scoring";
import type { LeadData, QuizResults, AxisKey } from "@/lib/types";

function escHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Email di alert interno quando il salvataggio su DB fallisce: contiene i dati
// minimi per recuperare il lead manualmente (va al team interno, PII attesa).
function buildDbAlertHtml(
  lead: LeadData,
  results: QuizResults,
  errorMessage: string
): string {
  const ctx = results.contextAnswers ?? {};
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">${escHtml(
      label
    )}</td><td style="padding:4px 0;">${escHtml(value)}</td></tr>`;

  return `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#333;">
      <h2 style="color:#b91c1c;margin:0 0 8px;">Salvataggio su database fallito</h2>
      <p>Il report e' stato inviato correttamente al lead, ma il salvataggio su
      Supabase e' fallito. Dati per il recupero manuale:</p>
      <table style="border-collapse:collapse;">
        ${row("Nome", `${lead.nome} ${lead.cognome}`)}
        ${row("Email", lead.email)}
        ${row("Azienda", lead.azienda)}
        ${row("Telefono", lead.telefono || "-")}
        ${row("Settore", ctx["X1"] || "-")}
        ${row("Dipendenti", ctx["X2"] || "-")}
        ${row("Punteggio", `${results.overallScore} - ${results.overallLabel}`)}
      </table>
      <p style="color:#666;font-size:12px;margin-top:16px;">Errore DB: ${escHtml(
        errorMessage
      )}</p>
    </div>`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { lead, results, quizAnswers, submissionToken } = body as {
      lead: LeadData;
      results: QuizResults;
      quizAnswers?: QuizAnswerMap;
      submissionToken?: string;
    };

    // --- Validation ---
    if (!lead || !results) {
      return NextResponse.json(
        { error: "Missing lead or results data." },
        { status: 400 }
      );
    }

    const requiredLeadFields: (keyof LeadData)[] = [
      "nome",
      "cognome",
      "email",
      "azienda",
    ];
    for (const field of requiredLeadFields) {
      if (!lead[field] || typeof lead[field] !== "string" || !lead[field].trim()) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    if (
      results.overallScore == null ||
      !results.overallLabel ||
      !Array.isArray(results.axisResults) ||
      !Array.isArray(results.compliance)
    ) {
      return NextResponse.json(
        { error: "Incomplete results data." },
        { status: 400 }
      );
    }

    // --- SMTP setup ---
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const from = process.env.SMTP_FROM || "digital@digitalautomations.it";
    const internalRecipient =
      process.env.REPORT_EMAIL || "digital@digitalautomations.it";

    // --- Generate spider chart PNG ---
    const chartData = results.axisResults.reduce(
      (acc: Record<string, number>, a: { key: string; score: number }) => {
        acc[a.key] = a.score;
        return acc;
      },
      {} as Record<AxisKey, number>
    ) as Record<AxisKey, number>;

    const chartTarget = results.axisResults.reduce(
      (acc: Record<string, number>, a: { key: string; score: number }) => {
        acc[a.key] = getTargetScore(a.key as AxisKey, a.score);
        return acc;
      },
      {} as Record<AxisKey, number>
    ) as Record<AxisKey, number>;

    const svgString = generateSpiderChartSVG(chartData, chartTarget);
    const chartPng = await sharp(Buffer.from(svgString))
      .resize(700)
      .png()
      .toBuffer();

    // --- Build emails ---
    const leadEmail = buildLeadEmail(lead, results);
    const internalEmail = buildInternalEmail(lead, results);

    const chartAttachment = {
      filename: "ai-readiness-chart.png",
      content: chartPng,
      cid: "spider-chart",
    };

    // --- Send both emails ---
    await Promise.all([
      transporter.sendMail({
        from,
        to: lead.email,
        subject: leadEmail.subject,
        html: leadEmail.html,
        attachments: [chartAttachment],
      }),
      transporter.sendMail({
        from,
        to: internalRecipient,
        subject: internalEmail.subject,
        html: internalEmail.html,
        attachments: [chartAttachment],
      }),
    ]);

    // --- Send to Encharge webhook (non-blocking) ---
    const enchargeUrl = process.env.ENCHARGE_WEBHOOK_URL;
    if (enchargeUrl) {
      fetch(enchargeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: lead.email,
          firstName: lead.nome,
          lastName: lead.cognome,
          company: lead.azienda,
          phone: lead.telefono || undefined,
          aiReadinessScore: results.overallScore,
          aiReadinessLabel: results.overallLabel,
        }),
      }).catch((err) => {
        console.error("[encharge] Webhook error:", err);
      });
    }

    // --- Persist to Supabase (AWAITED, con gestione errore esplicita) ---
    // L'email e' gia' partita sopra: un errore DB non deve mai bloccare il
    // report. Ma non deve nemmeno passare in silenzio → su fallimento parte un
    // alert interno con i dati minimi per recuperare il lead a mano.
    if (!supabaseAdmin) {
      console.warn(
        "[supabase] Service role client non configurato: submission NON salvata."
      );
    } else {
      try {
        const fields = {
          ...buildSubmissionFields(results, quizAnswers),
          nome: lead.nome,
          cognome: lead.cognome,
          email: lead.email,
          azienda: lead.azienda,
          telefono: lead.telefono || null,
          referral: lead.referral || null,
          consenso: lead.consenso ?? null,
          consenso_marketing: lead.consensoMarketing ?? null,
          status: "completed",
          completed_at: new Date().toISOString(),
        };

        // C — linking: se esiste un record anonimo per questo token, lo
        // promuoviamo a "completed" con i dati PII. Altrimenti inseriamo da zero.
        let linked = false;
        if (submissionToken) {
          const { data, error } = await supabaseAdmin
            .from("submissions")
            .update(fields)
            .eq("submission_token", submissionToken)
            .select("id");
          if (error) throw error;
          linked = Array.isArray(data) && data.length > 0;
        }

        if (!linked) {
          // Nessun record anonimo da collegare (token assente o non trovato,
          // es. track-result fallito): inserisci un record completo da zero.
          const { error } = await supabaseAdmin
            .from("submissions")
            .insert({ ...fields, submission_token: submissionToken || null });
          if (error) throw error;
        }
      } catch (dbError) {
        const dbMessage =
          dbError instanceof Error ? dbError.message : String(dbError);
        console.error("[supabase] Insert/Update error:", dbMessage);
        // Alert interno: non perdere il lead anche se il DB e' giu'.
        try {
          await transporter.sendMail({
            from,
            to: internalRecipient,
            subject: `[ALERT] Lead NON salvato su DB - ${lead.nome} ${lead.cognome} (${lead.azienda})`,
            html: buildDbAlertHtml(lead, results, dbMessage),
          });
        } catch (alertError) {
          console.error("[supabase] Alert email also failed:", alertError);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[send-report] Error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
