import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Landing from "@/components/quiz/Landing";
import Instructions from "@/components/quiz/Instructions";
import ContextPage from "@/components/quiz/ContextPage";
import AxisPage from "@/components/quiz/AxisPage";
import Results from "@/components/quiz/Results";
import LeadForm from "@/components/quiz/LeadForm";
import Report from "@/components/quiz/Report";
import SpiderChart from "@/components/quiz/SpiderChart";
import ComplianceChecklist from "@/components/quiz/ComplianceChecklist";
import ProgressBar from "@/components/quiz/ProgressBar";
import { CONTEXT_QUESTIONS, AXES } from "@/lib/quiz-data";

// ─── T27: Landing renders CTA button ───────────────────────────────────
describe("T27 – Landing component", () => {
  it("renders start button", () => {
    render(<Landing onStart={() => {}} />);
    const btn = screen.getByRole("button", { name: /inizia/i });
    expect(btn).toBeInTheDocument();
  });

  it("calls onStart when clicked", () => {
    let called = false;
    render(<Landing onStart={() => { called = true; }} />);
    fireEvent.click(screen.getByRole("button", { name: /inizia/i }));
    expect(called).toBe(true);
  });
});

// ─── T28: Instructions renders continue button ─────────────────────────
describe("T28 – Instructions component", () => {
  it("renders continue button with 'Ho capito, iniziamo'", () => {
    render(<Instructions onContinue={() => {}} />);
    const btn = screen.getByRole("button", { name: /ho capito/i });
    expect(btn).toBeInTheDocument();
  });
});

// ─── T29: ContextPage renders 3 questions and disables Avanti ──────────
describe("T29 – ContextPage renders all 3 context questions", () => {
  it("renders all 3 questions", () => {
    render(
      <ContextPage
        questions={CONTEXT_QUESTIONS}
        answers={{}}
        onSelect={() => {}}
        onNext={() => {}}
        onBack={() => {}}
      />
    );
    for (const q of CONTEXT_QUESTIONS) {
      expect(screen.getByText(new RegExp(q.text.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))).toBeInTheDocument();
    }
  });

  it("Avanti button is disabled when no answers", () => {
    render(
      <ContextPage
        questions={CONTEXT_QUESTIONS}
        answers={{}}
        onSelect={() => {}}
        onNext={() => {}}
        onBack={() => {}}
      />
    );
    const avanti = screen.getByRole("button", { name: /avanti/i });
    expect(avanti).toBeDisabled();
  });

  it("Avanti button is enabled when all 3 answered", () => {
    const answers = { X1: "IT e tecnologia", X2: "10-50", X3: "Titolare / CEO" };
    render(
      <ContextPage
        questions={CONTEXT_QUESTIONS}
        answers={answers}
        onSelect={() => {}}
        onNext={() => {}}
        onBack={() => {}}
      />
    );
    const avanti = screen.getByRole("button", { name: /avanti/i });
    expect(avanti).not.toBeDisabled();
  });
});

// ─── T30: AxisPage renders 5 questions for Axis 1 ──────────────────────
describe("T30 – AxisPage renders 5 questions for each axis", () => {
  it("renders all 5 questions for Conformita' (Axis 1)", () => {
    const axis = AXES[0];
    const { container } = render(
      <AxisPage
        axis={axis}
        axisIndex={0}
        totalAxes={6}
        answers={{}}
        onSelect={() => {}}
        onNext={() => {}}
        onBack={() => {}}
      />
    );
    const questionCards = container.querySelectorAll(".rounded-xl.border-2");
    expect(questionCards.length).toBe(5);
  });

  it("Avanti disabled when not all answered", () => {
    render(
      <AxisPage
        axis={AXES[0]}
        axisIndex={0}
        totalAxes={6}
        answers={{}}
        onSelect={() => {}}
        onNext={() => {}}
        onBack={() => {}}
      />
    );
    const avanti = screen.getByRole("button", { name: /avanti/i });
    expect(avanti).toBeDisabled();
  });

  it("Avanti enabled when all 5 answered", () => {
    const answers: Record<string, { letter: string; score: number }> = {};
    for (const q of AXES[0].questions) {
      answers[q.id] = { letter: "A", score: 1 };
    }
    render(
      <AxisPage
        axis={AXES[0]}
        axisIndex={0}
        totalAxes={6}
        answers={answers}
        onSelect={() => {}}
        onNext={() => {}}
        onBack={() => {}}
      />
    );
    const avanti = screen.getByRole("button", { name: /avanti/i });
    expect(avanti).not.toBeDisabled();
  });
});

// ─── T31: AxisPage renders all 6 axes correctly ────────────────────────
describe("T31 – All 6 axes render with 5 questions each", () => {
  for (let i = 0; i < AXES.length; i++) {
    it(`${AXES[i].label} renders 5 question cards`, () => {
      const { container } = render(
        <AxisPage
          axis={AXES[i]}
          axisIndex={i}
          totalAxes={6}
          answers={{}}
          onSelect={() => {}}
          onNext={() => {}}
          onBack={() => {}}
        />
      );
      const questionCards = container.querySelectorAll(".rounded-xl.border-2");
      expect(questionCards.length).toBe(5);
    });
  }
});

// ─── T32: Results renders spider chart and score table ─────────────────
describe("T32 – Results component renders correctly", () => {
  const axisResults = AXES.map((a) => ({
    key: a.key,
    label: a.label,
    formal: a.formal,
    score: 3.0,
    levelLabel: "In costruzione",
    levelColor: "#ca8a04",
  }));

  it("renders overall score", () => {
    const { container } = render(
      <Results
        overallScore={3.0}
        overallLabel="In costruzione"
        overallColor="#ca8a04"
        overallMessage="Test message"
        axisResults={axisResults}
        onGetReport={() => {}}
      />
    );
    const badge = container.querySelector(".text-5xl");
    expect(badge).toBeInTheDocument();
    expect(badge!.textContent).toBe("3.0");
  });

  it("renders CTA button for report", () => {
    render(
      <Results
        overallScore={3.0}
        overallLabel="In costruzione"
        overallColor="#ca8a04"
        overallMessage="Test message"
        axisResults={axisResults}
        onGetReport={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: /report/i })).toBeInTheDocument();
  });

  it("renders all 6 axis labels in score table", () => {
    render(
      <Results
        overallScore={3.0}
        overallLabel="In costruzione"
        overallColor="#ca8a04"
        overallMessage="Test message"
        axisResults={axisResults}
        onGetReport={() => {}}
      />
    );
    for (const a of axisResults) {
      expect(screen.getAllByText(a.label).length).toBeGreaterThanOrEqual(1);
    }
  });
});

// ─── T32b: Results curiosity teaser (Funnel Fase 0) ────────────────────
describe("T32b – Results curiosity teaser", () => {
  const axisResults = AXES.map((a) => ({
    key: a.key,
    label: a.label,
    formal: a.formal,
    score: 3.0,
    levelLabel: "In costruzione",
    levelColor: "#ca8a04",
  }));

  const baseProps = {
    overallScore: 3.0,
    overallLabel: "In costruzione",
    overallColor: "#ca8a04",
    overallMessage: "Test message",
    axisResults,
    onGetReport: () => {},
  };

  it("shows compliance risk count and weakest axis name (plural)", () => {
    render(
      <Results {...baseProps} complianceRiskCount={3} weakestAxisLabel="Conformità" />
    );
    expect(screen.getByText(/piano d'azione personalizzato/i)).toBeInTheDocument();
    expect(screen.getByText(/rischi di conformità rilevati/i)).toBeInTheDocument();
    expect(screen.getByText(/punto più debole/i)).toBeInTheDocument();
    // Il nome dell'asse compare nel teaser (oltre che nella tabella).
    expect(screen.getAllByText(/Conformità/).length).toBeGreaterThanOrEqual(1);
  });

  it("uses singular wording for a single risk", () => {
    render(
      <Results {...baseProps} complianceRiskCount={1} weakestAxisLabel="Processi" />
    );
    expect(screen.getByText(/rischio di conformità rilevato/i)).toBeInTheDocument();
  });

  it("hides the risk line when count is 0 but still shows weakest axis", () => {
    render(
      <Results {...baseProps} complianceRiskCount={0} weakestAxisLabel="Processi" />
    );
    expect(screen.queryByText(/di conformità rilevat/i)).not.toBeInTheDocument();
    expect(screen.getByText(/punto più debole/i)).toBeInTheDocument();
  });

  it("renders no teaser when no teaser data is provided", () => {
    render(<Results {...baseProps} />);
    expect(screen.queryByText(/piano d'azione personalizzato/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/punto più debole/i)).not.toBeInTheDocument();
  });

  it("does NOT remove the score badge, chart or score table when teaser is shown", () => {
    const { container } = render(
      <Results {...baseProps} complianceRiskCount={3} weakestAxisLabel="Conformità" />
    );
    // Punteggio complessivo
    expect(container.querySelector(".text-5xl")!.textContent).toBe("3.0");
    // Grafico ragno (SVG) presente
    expect(container.querySelector("svg")).toBeInTheDocument();
    // Tabella dei 6 punteggi: tutte le etichette presenti
    for (const a of axisResults) {
      expect(screen.getAllByText(a.label).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("calls onGetReport when the CTA is clicked", () => {
    let called = false;
    render(
      <Results
        {...baseProps}
        complianceRiskCount={3}
        weakestAxisLabel="Conformità"
        onGetReport={() => {
          called = true;
        }}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /report/i }));
    expect(called).toBe(true);
  });
});

// ─── T33: LeadForm validation ──────────────────────────────────────────
describe("T33 – LeadForm validation", () => {
  it("submit button disabled when form empty", () => {
    render(<LeadForm onSubmit={() => {}} isSubmitting={false} />);
    const btn = screen.getByRole("button", { name: /invia/i });
    expect(btn).toBeDisabled();
  });

  it("renders all required fields (nome, cognome, email, azienda)", () => {
    render(<LeadForm onSubmit={() => {}} isSubmitting={false} />);
    expect(screen.getByPlaceholderText("Mario")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Rossi")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/mario\.rossi/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nome azienda/i)).toBeInTheDocument();
  });

  it("telefono field is optional (label has no asterisk)", () => {
    render(<LeadForm onSubmit={() => {}} isSubmitting={false} />);
    const telefonoLabel = screen.getByText(/telefono/i);
    expect(telefonoLabel.textContent).not.toContain("*");
  });

  it("shows 'Invio in corso...' when isSubmitting", () => {
    render(<LeadForm onSubmit={() => {}} isSubmitting={true} />);
    expect(screen.getByText(/invio in corso/i)).toBeInTheDocument();
  });
});

// ─── T34: SpiderChart renders SVG ──────────────────────────────────────
describe("T34 – SpiderChart renders SVG with 6 axes", () => {
  const data = {
    conformita: 3.0 as number,
    processi: 2.5 as number,
    utilizzo: 4.0 as number,
    autonomia: 1.5 as number,
    protezione: 3.5 as number,
    tecnologia: 2.0 as number,
  };

  it("renders an SVG element", () => {
    const { container } = render(<SpiderChart data={data} size={380} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders axis labels", () => {
    render(<SpiderChart data={data} size={380} />);
    expect(screen.getByText(/Tecnologia/i)).toBeInTheDocument();
  });
});

// ─── T35: ComplianceChecklist renders 7 rows ───────────────────────────
describe("T35 – ComplianceChecklist renders 7 compliance areas", () => {
  const compliance = [
    { name: "Registro Strumenti AI", reference: "ref", score: 1.0, color: "red" as const, message: "msg", action: "act" },
    { name: "Registro Casi d'Uso", reference: "ref", score: 2.0, color: "yellow" as const, message: "msg", action: "act" },
    { name: "AI Policy interna", reference: "ref", score: 3.5, color: "green" as const, message: "msg", action: "act" },
    { name: "Informative trasparenza", reference: "ref", score: 1.5, color: "red" as const, message: "msg", action: "act" },
    { name: "Formazione", reference: "ref", score: 2.5, color: "yellow" as const, message: "msg", action: "act" },
    { name: "DPIA", reference: "ref", score: 4.0, color: "green" as const, message: "msg", action: "act" },
    { name: "Monitoraggio", reference: "ref", score: 3.0, color: "yellow" as const, message: "msg", action: "act" },
  ];

  it("renders all 7 area names", () => {
    render(<ComplianceChecklist compliance={compliance} />);
    for (const c of compliance) {
      expect(screen.getByText(c.name)).toBeInTheDocument();
    }
  });
});

// ─── T36: Report confirmation banner ───────────────────────────────────
// La pagina di conferma "ThankYou" e' stata rimossa (Option A): la conferma
// dell'invio email vive ora come banner in cima al Report, che e' la schermata
// finale del funnel. Questo test copre quel comportamento spostato.
describe("T36 – Report confirmation banner", () => {
  const axisResults = AXES.map((a) => ({
    key: a.key,
    label: a.label,
    formal: a.formal,
    score: 3.0,
    levelLabel: "In costruzione",
    levelColor: "#ca8a04",
  }));
  const compliance = [
    { name: "Registro Strumenti AI", reference: "ref", score: 1.0, color: "red" as const, message: "msg", action: "act" },
    { name: "AI Policy interna", reference: "ref", score: 3.5, color: "green" as const, message: "msg", action: "act" },
  ];
  const baseProps = {
    axisResults,
    overallScore: 3.0,
    overallLabel: "In costruzione",
    overallColor: "#ca8a04",
    overallMessage: "Test message",
    compliance,
    leadName: "Mario",
    email: "mario@test.it",
  };

  it("shows the confirmation banner with the lead email", () => {
    render(<Report {...baseProps} />);
    expect(screen.getByText(/Fatto!/)).toBeInTheDocument();
    expect(screen.getByText("mario@test.it")).toBeInTheDocument();
  });

  it("no longer links to a removed confirmation page", () => {
    render(<Report {...baseProps} />);
    expect(screen.queryByText(/pagina di conferma/i)).not.toBeInTheDocument();
  });
});

// ─── T37: ProgressBar shows axis info ──────────────────────────────────
describe("T37 – ProgressBar shows axis progress", () => {
  it("renders axis label and position", () => {
    render(<ProgressBar axisLabel="Conformita'" axisIndex={0} totalAxes={6} />);
    expect(screen.getByText(/Asse 1 di 6/)).toBeInTheDocument();
  });
});
