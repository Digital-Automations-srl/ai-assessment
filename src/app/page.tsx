"use client";

import { useState, useCallback } from "react";
import { CONTEXT_QUESTIONS, AXES } from "@/lib/quiz-data";
import { calculateResults } from "@/lib/scoring";
import type { LeadData } from "@/lib/types";
import Header from "@/components/quiz/Header";
import Landing from "@/components/quiz/Landing";
import Instructions from "@/components/quiz/Instructions";
import ContextQuestion from "@/components/quiz/ContextQuestion";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import AxisTransition from "@/components/quiz/AxisTransition";
import Results from "@/components/quiz/Results";
import LeadForm from "@/components/quiz/LeadForm";
import Report from "@/components/quiz/Report";
import ThankYou from "@/components/quiz/ThankYou";

type Step =
  | "landing"
  | "instructions"
  | "context"
  | "quiz"
  | "axis-transition"
  | "results"
  | "lead-form"
  | "report"
  | "thank-you";

export default function QuizPage() {
  const [step, setStep] = useState<Step>("landing");
  const [contextIndex, setContextIndex] = useState(0);
  const [axisIndex, setAxisIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [contextAnswers, setContextAnswers] = useState<Record<string, string>>(
    {}
  );
  const [quizAnswers, setQuizAnswers] = useState<
    Record<string, { letter: string; score: number }>
  >({});
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentAxis = AXES[axisIndex];
  const currentQuestion = currentAxis?.questions[questionIndex];

  const computeResults = useCallback(() => {
    const scoreMap: Record<string, number> = {};
    for (const [qId, ans] of Object.entries(quizAnswers)) {
      scoreMap[qId] = ans.score;
    }
    return calculateResults(scoreMap, contextAnswers, AXES);
  }, [quizAnswers, contextAnswers]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // --- Context question handlers ---
  const handleContextSelect = (option: string) => {
    setContextAnswers((prev) => ({
      ...prev,
      [CONTEXT_QUESTIONS[contextIndex].id]: option,
    }));
  };

  const handleContextNext = () => {
    if (contextIndex < CONTEXT_QUESTIONS.length - 1) {
      setContextIndex((i) => i + 1);
    } else {
      setStep("quiz");
      setAxisIndex(0);
      setQuestionIndex(0);
    }
    scrollToTop();
  };

  const handleContextBack = () => {
    if (contextIndex > 0) {
      setContextIndex((i) => i - 1);
    } else {
      setStep("instructions");
    }
    scrollToTop();
  };

  // --- Quiz question handlers ---
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
    if (questionIndex < currentAxis.questions.length - 1) {
      setQuestionIndex((i) => i + 1);
    } else if (axisIndex < AXES.length - 1) {
      setStep("axis-transition");
    } else {
      setStep("results");
    }
    scrollToTop();
  };

  const handleQuizBack = () => {
    if (questionIndex > 0) {
      setQuestionIndex((i) => i - 1);
    } else if (axisIndex > 0) {
      setAxisIndex((i) => i - 1);
      setQuestionIndex(AXES[axisIndex - 1].questions.length - 1);
    } else {
      setStep("context");
      setContextIndex(CONTEXT_QUESTIONS.length - 1);
    }
    scrollToTop();
  };

  const handleAxisTransitionContinue = () => {
    setAxisIndex((i) => i + 1);
    setQuestionIndex(0);
    setStep("quiz");
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
              setContextIndex(0);
              scrollToTop();
            }}
          />
        )}

        {step === "context" && (
          <ContextQuestion
            question={CONTEXT_QUESTIONS[contextIndex]}
            selectedOption={
              contextAnswers[CONTEXT_QUESTIONS[contextIndex].id] ?? null
            }
            onSelect={handleContextSelect}
            onNext={handleContextNext}
            onBack={contextIndex > 0 ? handleContextBack : undefined}
            questionIndex={contextIndex}
            totalQuestions={CONTEXT_QUESTIONS.length}
          />
        )}

        {step === "quiz" && currentQuestion && (
          <QuizQuestion
            question={currentQuestion}
            axisLabel={currentAxis.label}
            axisIndex={axisIndex}
            totalAxes={AXES.length}
            questionIndex={questionIndex}
            totalQuestions={currentAxis.questions.length}
            selectedOption={quizAnswers[currentQuestion.id]?.letter ?? null}
            onSelect={handleQuizSelect}
            onNext={handleQuizNext}
            onBack={handleQuizBack}
          />
        )}

        {step === "axis-transition" && (
          <AxisTransition
            completedAxisLabel={currentAxis.label}
            nextAxisLabel={AXES[axisIndex + 1]?.label ?? ""}
            nextAxisIndex={axisIndex + 1}
            totalAxes={AXES.length}
            onContinue={handleAxisTransitionContinue}
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
