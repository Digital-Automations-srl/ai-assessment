import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import sharp from "sharp";
import { buildLeadEmail, buildInternalEmail } from "@/lib/email";
import { supabase } from "@/lib/supabase";
import { generateSpiderChartSVG } from "@/lib/spider-chart-svg";
import { getTargetScore } from "@/lib/scoring";
import type { LeadData, QuizResults, AxisKey } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { lead, results } = body as {
      lead: LeadData;
      results: QuizResults;
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

    // --- Save to Supabase (non-blocking) ---
    if (supabase) {
      const axisScores = results.axisResults.reduce(
        (acc: Record<string, number>, a: { key: string; score: number }) => {
          acc[`score_${a.key}`] = a.score;
          return acc;
        },
        {} as Record<string, number>
      );

      supabase
        .from("submissions")
        .insert({
          nome: lead.nome,
          cognome: lead.cognome,
          email: lead.email,
          azienda: lead.azienda,
          telefono: lead.telefono || null,
          referral: lead.referral || null,
          settore: results.contextAnswers?.["settore"] ?? results.contextAnswers?.["Settore"] ?? null,
          dipendenti: results.contextAnswers?.["dipendenti"] ?? results.contextAnswers?.["Dipendenti"] ?? null,
          ai_usage: results.contextAnswers?.["uso AI"] ?? results.contextAnswers?.["Uso AI"] ?? null,
          overall_score: results.overallScore,
          overall_label: results.overallLabel,
          ...axisScores,
          answers: results.contextAnswers,
          compliance: results.compliance,
        })
        .then(({ error: dbError }) => {
          if (dbError) console.error("[supabase] Insert error:", dbError.message);
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[send-report] Error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
