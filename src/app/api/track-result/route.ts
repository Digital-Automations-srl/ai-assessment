import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildSubmissionFields, type QuizAnswerMap } from "@/lib/submission-record";
import type { QuizResults } from "@/lib/types";

// Cattura ANONIMA allo step "results" (completamenti senza lead).
// Crea un record con punteggi + contesto + 30 risposte, SENZA alcun PII,
// SENZA IP ne' identificatori persistenti: solo il token di sessione effimero
// generato dal client, che servira' poi a collegare il lead (UPDATE in
// /api/send-report). Best-effort: un fallimento non deve bloccare la UX.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionToken, results, quizAnswers } = body as {
      submissionToken?: string;
      results?: QuizResults;
      quizAnswers?: QuizAnswerMap;
    };

    // --- Validazione minima (nessun PII atteso qui) ---
    if (!submissionToken || typeof submissionToken !== "string") {
      return NextResponse.json(
        { error: "Missing submissionToken." },
        { status: 400 }
      );
    }

    if (
      !results ||
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

    if (!supabaseAdmin) {
      console.warn(
        "[track-result] Service role client non configurato: tracking anonimo saltato."
      );
      // Non e' un errore lato client: il tracking anonimo e' best-effort.
      return NextResponse.json({ ok: false, skipped: true });
    }

    // Record ANONIMO: nessun PII, nessun IP, nessun identificatore persistente.
    // upsert con ignoreDuplicates per essere idempotente se l'effetto rifa' la
    // chiamata (es. StrictMode in dev rimonta i componenti).
    const { error } = await supabaseAdmin.from("submissions").upsert(
      {
        submission_token: submissionToken,
        status: "anonymous",
        ...buildSubmissionFields(results, quizAnswers),
      },
      { onConflict: "submission_token", ignoreDuplicates: true }
    );

    if (error) {
      console.error("[track-result] Insert error:", error.message);
      // 200 ok:false → il client prosegue comunque (tracking best-effort).
      return NextResponse.json({ ok: false, error: error.message });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[track-result] Error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
