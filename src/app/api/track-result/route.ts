import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  buildSubmissionFields,
  sanitizeBehavior,
  type QuizAnswerMap,
} from "@/lib/submission-record";
import {
  logEvent,
  newRequestId,
  recordFailure,
  recordSuccess,
} from "@/lib/observability";
import { utmColumns, type UtmParams } from "@/lib/utm";
import type { QuizResults } from "@/lib/types";

// Cattura ANONIMA allo step "results" (completamenti senza lead).
// Crea un record con punteggi + contesto + 30 risposte, SENZA alcun PII,
// SENZA IP ne' identificatori persistenti: solo il token di sessione effimero
// generato dal client, che servira' poi a collegare il lead (UPDATE in
// /api/send-report). Best-effort: un fallimento non deve bloccare la UX.
export async function POST(request: NextRequest) {
  const requestId = newRequestId();
  try {
    const body = await request.json();
    const { submissionToken, results, quizAnswers, utm, behavior } = body as {
      submissionToken?: string;
      results?: QuizResults;
      quizAnswers?: QuizAnswerMap;
      utm?: UtmParams;
      behavior?: unknown;
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
      logEvent("track_result.upsert", "warn", {
        requestId,
        reason: "supabase_admin_unconfigured",
      });
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
        ...utmColumns(utm),
        behavior: sanitizeBehavior(behavior),
      },
      { onConflict: "submission_token", ignoreDuplicates: true }
    );

    if (error) {
      // Stesso canale "db" di send-report: una serie di fallimenti qui alza il
      // contatore consecutivo, cosi' l'alert del primo lead completato segnala
      // un'outage gia' in corso. Nessuna email qui (tracking anonimo best-effort).
      const failures = recordFailure("db");
      logEvent("track_result.upsert", "error", {
        requestId,
        error: error.message,
        consecutiveFailures: failures,
      });
      // 200 ok:false → il client prosegue comunque (tracking best-effort).
      return NextResponse.json({ ok: false, error: error.message });
    }

    // Verifica post-scrittura: con ignoreDuplicates l'upsert non ritorna la riga,
    // quindi rileggiamo per token per confermare la persistenza.
    const { data: verifyRow, error: verifyError } = await supabaseAdmin
      .from("submissions")
      .select("id")
      .eq("submission_token", submissionToken)
      .maybeSingle();
    if (verifyError || !verifyRow) {
      const failures = recordFailure("db");
      logEvent("track_result.verify", "error", {
        requestId,
        error: verifyError?.message ?? "riga non trovata dopo upsert",
        consecutiveFailures: failures,
      });
      return NextResponse.json({ ok: false, error: "verification_failed" });
    }

    recordSuccess("db");
    logEvent("track_result.upsert", "ok", { requestId });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";
    logEvent("track_result.error", "error", { requestId, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
