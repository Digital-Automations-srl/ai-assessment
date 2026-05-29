import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import sharp from "sharp";
import { buildLeadEmail, buildInternalEmail } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildSubmissionFields, type QuizAnswerMap } from "@/lib/submission-record";
import { generateSpiderChartSVG } from "@/lib/spider-chart-svg";
import { getTargetScore } from "@/lib/scoring";
import {
  deliverWebhook,
  logEvent,
  newRequestId,
  recordFailure,
  recordSuccess,
} from "@/lib/observability";
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

// Alert interno quando il webhook Encharge fallisce dopo i retry: il lead e'
// salvato, ma il nurturing automatico non e' partito → recupero manuale.
function buildWebhookAlertHtml(
  lead: LeadData,
  errorMessage: string,
  attempts: number
): string {
  return `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#333;">
      <h2 style="color:#b91c1c;margin:0 0 8px;">Webhook Encharge fallito</h2>
      <p>Il lead <strong>${escHtml(`${lead.nome} ${lead.cognome}`)}</strong>
      (${escHtml(lead.email)}, ${escHtml(lead.azienda)}) e' stato salvato, ma
      l'invio al webhook Encharge e' fallito dopo ${attempts} tentativi.
      Aggiungere il contatto manualmente al flusso di nurturing.</p>
      <p style="color:#666;font-size:12px;margin-top:16px;">Errore: ${escHtml(
        errorMessage
      )}</p>
    </div>`;
}

export async function POST(request: NextRequest) {
  const requestId = newRequestId();
  const startedAt = Date.now();
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

    logEvent("send_report.email_sent", "ok", {
      requestId,
      recipientDomain: lead.email.split("@")[1] ?? null,
      overallScore: results.overallScore,
    });

    // --- Persist to Supabase (AWAITED, con verifica post-scrittura) ---
    // L'email e' gia' partita: un errore DB non deve mai bloccare il report, ma
    // non deve nemmeno passare in silenzio. La scrittura viene RILETTA per
    // confermare che la riga sia davvero atterrata: l'incidente "pausa Supabase"
    // dava insert riusciti-in-apparenza con host irraggiungibile. Su fallimento
    // (errore o verifica negativa) parte un alert interno coi dati di recupero.
    if (!supabaseAdmin) {
      logEvent("send_report.persist", "warn", {
        requestId,
        reason: "supabase_admin_unconfigured",
      });
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
        let persistedId: string | null = null;
        let linked = false;
        if (submissionToken) {
          const { data, error } = await supabaseAdmin
            .from("submissions")
            .update(fields)
            .eq("submission_token", submissionToken)
            .select("id");
          if (error) throw error;
          if (Array.isArray(data) && data.length > 0) {
            linked = true;
            persistedId = (data[0] as { id: string }).id;
          }
        }

        if (!linked) {
          // Nessun record anonimo da collegare (token assente o non trovato,
          // es. track-result fallito): inserisci un record completo da zero.
          const { data, error } = await supabaseAdmin
            .from("submissions")
            .insert({ ...fields, submission_token: submissionToken || null })
            .select("id");
          if (error) throw error;
          persistedId =
            Array.isArray(data) && data.length > 0
              ? (data[0] as { id: string }).id
              : null;
        }

        // Verifica post-scrittura: rileggi la riga appena scritta.
        let verified = false;
        const locator = persistedId
          ? { col: "id", val: persistedId }
          : submissionToken
            ? { col: "submission_token", val: submissionToken }
            : null;
        if (locator) {
          const { data, error } = await supabaseAdmin
            .from("submissions")
            .select("id")
            .eq(locator.col, locator.val)
            .maybeSingle();
          if (error) throw error;
          verified = !!data;
        }
        if (!verified) {
          throw new Error(
            "verifica post-scrittura fallita: riga non trovata dopo insert/update"
          );
        }

        recordSuccess("db");
        logEvent("send_report.persist", "ok", {
          requestId,
          linked,
          submissionId: persistedId,
        });
      } catch (dbError) {
        const dbMessage =
          dbError instanceof Error ? dbError.message : String(dbError);
        const failures = recordFailure("db");
        logEvent("send_report.persist", "error", {
          requestId,
          error: dbMessage,
          consecutiveFailures: failures,
        });
        // Alert interno: non perdere il lead anche se il DB e' giu'.
        try {
          await transporter.sendMail({
            from,
            to: internalRecipient,
            subject: `[ALERT] Lead NON salvato su DB${
              failures > 1 ? ` (${failures}° fallimento consecutivo)` : ""
            } - ${lead.nome} ${lead.cognome} (${lead.azienda})`,
            html: buildDbAlertHtml(lead, results, dbMessage),
          });
        } catch (alertError) {
          logEvent("send_report.alert_email", "error", {
            requestId,
            error:
              alertError instanceof Error
                ? alertError.message
                : String(alertError),
          });
        }
      }
    }

    // --- Encharge webhook (AWAITED, retry + backoff) ---
    // Eseguito DOPO la persistenza (la cattura del lead e' piu' critica del
    // nurturing). Timeout per-tentativo contenuto: in un outage prolungato di
    // Encharge la richiesta si allunga di qualche secondo (raro) ma il report al
    // lead e' gia' partito. Esauriti i retry → alert interno + log error.
    const enchargeUrl = process.env.ENCHARGE_WEBHOOK_URL;
    if (enchargeUrl) {
      const result = await deliverWebhook(
        enchargeUrl,
        {
          email: lead.email,
          firstName: lead.nome,
          lastName: lead.cognome,
          company: lead.azienda,
          phone: lead.telefono || undefined,
          aiReadinessScore: results.overallScore,
          aiReadinessLabel: results.overallLabel,
        },
        {
          requestId,
          channel: "encharge",
          event: "encharge.webhook",
          maxAttempts: 3,
          timeoutMs: 2500,
          baseDelayMs: 250,
        }
      );
      if (!result.ok) {
        try {
          await transporter.sendMail({
            from,
            to: internalRecipient,
            subject: `[ALERT] Webhook Encharge fallito dopo ${result.attempts} tentativi${
              result.consecutiveFailures > 1
                ? ` (${result.consecutiveFailures}° consecutivo)`
                : ""
            } - ${lead.nome} ${lead.cognome}`,
            html: buildWebhookAlertHtml(
              lead,
              result.error ?? "errore sconosciuto",
              result.attempts
            ),
          });
        } catch (alertError) {
          logEvent("encharge.alert_email", "error", {
            requestId,
            error:
              alertError instanceof Error
                ? alertError.message
                : String(alertError),
          });
        }
      }
    }

    logEvent("send_report.done", "ok", {
      requestId,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";
    logEvent("send_report.error", "error", {
      requestId,
      error: message,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
