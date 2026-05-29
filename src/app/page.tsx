"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { CONTEXT_QUESTIONS, AXES } from "@/lib/quiz-data";
import { calculateResults } from "@/lib/scoring";
import { pickUtm, type UtmParams } from "@/lib/utm";
import { buildBehavior } from "@/lib/behavior";
import type { LeadData } from "@/lib/types";
import Header from "@/components/quiz/Header";
import Landing from "@/components/quiz/Landing";
import Instructions from "@/components/quiz/Instructions";
import ContextPage from "@/components/quiz/ContextPage";
import AxisPage from "@/components/quiz/AxisPage";
import Results from "@/components/quiz/Results";
import LeadForm from "@/components/quiz/LeadForm";
import Report from "@/components/quiz/Report";
import ThankYou from "@/components/quiz/ThankYou";

type Step =
  | "landing"
  | "instructions"
  | "context"
  | "quiz"
  | "results"
  | "lead-form"
  | "report"
  | "thank-you";

export default function QuizPage() {
  const [step, setStep] = useState<Step>("landing");
  const [axisIndex, setAxisIndex] = useState(0);
  const [contextAnswers, setContextAnswers] = useState<Record<string, string>>(
    {}
  );
  const [quizAnswers, setQuizAnswers] = useState<
    Record<string, { letter: string; score: number }>
  >({});
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Token di sessione effimero (uuid v4) per collegare il record anonimo
  // creato allo step "results" al lead inviato col form. Vive in un ref:
  // non e' persistito (no cookie/localStorage) e si rinnova a ogni reload.
  const submissionTokenRef = useRef<string | null>(null);
  const trackedRef = useRef(false);

  // DATA-1: cattura i parametri utm_* dal primo load (prima di qualsiasi
  // navigazione interna), conservati in un ref e inviati con track-result e
  // send-report per l'attribuzione sorgente del lead.
  const utmRef = useRef<UtmParams>({});
  useEffect(() => {
    utmRef.current = pickUtm(new URLSearchParams(window.location.search));
  }, []);

  // DATA-2: segnali comportamentali. startTime = quiz_started (uscita landing);
  // backClicks = click "Indietro" totali. buildBehavior li combina con i conteggi.
  const startTimeRef = useRef<number | null>(null);
  const backClicksRef = useRef(0);
  const collectBehavior = useCallback(
    () =>
      buildBehavior({
        quizAnswers,
        totalTimeMs: startTimeRef.current ? Date.now() - startTimeRef.current : null,
        backClicks: backClicksRef.current,
      }),
    [quizAnswers]
  );

  const currentAxis = AXES[axisIndex];

  const computeResults = useCallback(() => {
    const scoreMap: Record<string, number> = {};
    for (const [qId, ans] of Object.entries(quizAnswers)) {
      scoreMap[qId] = ans.score;
    }
    return calculateResults(scoreMap, contextAnswers, AXES);
  }, [quizAnswers, contextAnswers]);

  // C — cattura anonima: allo step "results" crea un record SENZA PII
  // (punteggi + contesto + 30 risposte) collegato al token effimero.
  useEffect(() => {
    if (step !== "results" || trackedRef.current) return;
    trackedRef.current = true;

    const token = crypto.randomUUID();
    submissionTokenRef.current = token;

    const r = computeResults();
    fetch("/api/track-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submissionToken: token,
        quizAnswers,
        utm: utmRef.current,
        behavior: collectBehavior(),
        results: {
          contextAnswers,
          axisResults: r.axisResults,
          overallScore: r.overallScore,
          overallLabel: r.overallLabel,
          compliance: r.compliance,
        },
      }),
    }).catch(() => {
      // Tracking anonimo best-effort: non deve mai bloccare la UX.
    });
  }, [step, computeResults, collectBehavior, quizAnswers, contextAnswers]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "instant" });

  // --- Context page handlers ---
  const handleContextSelect = (questionId: string, option: string) => {
    setContextAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleContextNext = () => {
    setStep("quiz");
    setAxisIndex(0);
    scrollToTop();
  };

  const handleContextBack = () => {
    backClicksRef.current += 1;
    setStep("instructions");
    scrollToTop();
  };

  // --- Quiz (axis page) handlers ---
  const handleQuizSelect = (
    questionId: string,
    optionLetter: string,
    score: number
  ) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: { letter: optionLetter, score },
    }));
  };

  const handleQuizNext = () => {
    if (axisIndex < AXES.length - 1) {
      setAxisIndex((i) => i + 1);
    } else {
      setStep("results");
    }
    scrollToTop();
  };

  const handleQuizBack = () => {
    backClicksRef.current += 1;
    if (axisIndex > 0) {
      setAxisIndex((i) => i - 1);
    } else {
      setStep("context");
    }
    scrollToTop();
  };

  // --- Lead form handler ---
  const handleLeadSubmit = async (data: LeadData) => {
    setLeadData(data);
    setIsSubmitting(true);

    const r = computeResults();
    try {
      await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: data,
          submissionToken: submissionTokenRef.current,
          quizAnswers,
          utm: utmRef.current,
          behavior: collectBehavior(),
          results: {
            contextAnswers,
            axisResults: r.axisResults,
            overallScore: r.overallScore,
            overallLabel: r.overallLabel,
            compliance: r.compliance,
          },
        }),
      });
    } catch {
      // Email failure shouldn't block the user from seeing the report
    }

    setIsSubmitting(false);
    setStep("report");
    scrollToTop();
  };

  const r =
    step === "results" || step === "report" || step === "thank-you"
      ? computeResults()
      : null;

  return (
    <>
      <Header />
      <main className="flex-1">
        {step === "landing" && (
          <Landing
            onStart={() => {
              startTimeRef.current = Date.now();
              setStep("instructions");
              scrollToTop();
            }}
          />
        )}

        {step === "instructions" && (
          <Instructions
            onContinue={() => {
              setStep("context");
              scrollToTop();
            }}
          />
        )}

        {step === "context" && (
          <ContextPage
            questions={CONTEXT_QUESTIONS}
            answers={contextAnswers}
            onSelect={handleContextSelect}
            onNext={handleContextNext}
            onBack={handleContextBack}
          />
        )}

        {step === "quiz" && currentAxis && (
          <AxisPage
            axis={currentAxis}
            axisIndex={axisIndex}
            totalAxes={AXES.length}
            answers={quizAnswers}
            onSelect={handleQuizSelect}
            onNext={handleQuizNext}
            onBack={handleQuizBack}
          />
        )}

        {step === "results" && r && (
          <Results
            overallScore={r.overallScore}
            overallLabel={r.overallLabel}
            overallColor={r.overallColor}
            overallMessage={r.overallMessage}
            axisResults={r.axisResults}
            onGetReport={() => {
              setStep("lead-form");
              scrollToTop();
            }}
          />
        )}

        {step === "lead-form" && (
          <LeadForm onSubmit={handleLeadSubmit} isSubmitting={isSubmitting} />
        )}

        {step === "report" && r && leadData && (
          <Report
            axisResults={r.axisResults}
            overallScore={r.overallScore}
            overallLabel={r.overallLabel}
            overallColor={r.overallColor}
            overallMessage={r.overallMessage}
            compliance={r.compliance}
            leadName={leadData.nome}
            onThankYou={() => {
              setStep("thank-you");
              scrollToTop();
            }}
          />
        )}

        {step === "thank-you" && leadData && (
          <ThankYou name={leadData.nome} email={leadData.email} />
        )}
      </main>
    </>
  );
}
