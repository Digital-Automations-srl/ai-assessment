"use client";

import { useState, useCallback } from "react";
import { CONTEXT_QUESTIONS, AXES } from "@/lib/quiz-data";
import { calculateResults } from "@/lib/scoring";
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

  const currentAxis = AXES[axisIndex];

  const computeResults = useCallback(() => {
    const scoreMap: Record<string, number> = {};
    for (const [qId, ans] of Object.entries(quizAnswers)) {
      scoreMap[qId] = ans.score;
    }
    return calculateResults(scoreMap, contextAnswers, AXES);
  }, [quizAnswers, contextAnswers]);

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
