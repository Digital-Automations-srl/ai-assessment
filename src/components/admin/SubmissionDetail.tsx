import ComplianceChecklist from "@/components/quiz/ComplianceChecklist";
import SpiderChart from "@/components/quiz/SpiderChart";
import { dash, formatDateTime, formatScore } from "@/lib/admin/format";
import { AXIS_KEYS } from "@/lib/admin/queries";
import { AXIS_QUESTIONS } from "@/lib/admin/quiz-lookup";
import type { SubmissionRow } from "@/lib/admin/types";
import { getLevel, getTargetScore } from "@/lib/scoring";
import type { AxisKey } from "@/lib/types";

const AXIS_LABEL: Record<string, string> = Object.fromEntries(
  AXIS_QUESTIONS.map((a) => [a.key, a.label])
);

function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
      {title && (
        <h2 className="mb-4 text-base font-extrabold" style={{ color: "#004172" }}>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-gray-800">{value}</dd>
    </div>
  );
}

function boolLabel(v: boolean | null): string {
  return v == null ? "—" : v ? "Sì" : "No";
}

export default function SubmissionDetail({ row }: { row: SubmissionRow }) {
  const isCompleted = row.status === "completed";
  const ctx = row.answers ?? {};

  const axisData = {} as Record<AxisKey, number>;
  const axisTarget = {} as Record<AxisKey, number>;
  for (const k of AXIS_KEYS) {
    const v = row[`score_${k}` as keyof SubmissionRow] as number | null;
    axisData[k] = v ?? 0;
    axisTarget[k] = getTargetScore(k, v ?? 0);
  }

  const overallColor =
    row.overall_score != null ? getLevel(row.overall_score).color : "#999";

  const quizAnswers = row.quiz_answers ?? null;
  const hasAnswers = quizAnswers && Object.keys(quizAnswers).length > 0;

  return (
    <div className="space-y-5">
      {/* Anagrafica / contesto */}
      <Card title={isCompleted ? "Anagrafica" : "Record anonimo"}>
        {!isCompleted && (
          <p className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Assessment completato senza invio del form: nessun dato personale
            raccolto. Sono disponibili punteggi, contesto e risposte.
          </p>
        )}
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {isCompleted && (
            <>
              <Field label="Nome" value={dash(`${row.nome ?? ""} ${row.cognome ?? ""}`.trim())} />
              <Field
                label="Email"
                value={
                  row.email ? (
                    <a
                      href={`mailto:${row.email}`}
                      className="text-[#016FC0] hover:underline"
                    >
                      {row.email}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              <Field label="Telefono" value={dash(row.telefono)} />
            </>
          )}
          <Field label="Azienda" value={dash(row.azienda)} />
          <Field label="Settore" value={dash(row.settore)} />
          <Field label="Dimensione" value={dash(row.dipendenti)} />
          <Field label="Ruolo" value={dash(ctx["X3"])} />
          <Field label="Come ci ha conosciuti" value={dash(row.referral)} />
          <Field label="Uso AI dichiarato" value={dash(row.ai_usage)} />
          {isCompleted && (
            <>
              <Field label="Consenso privacy" value={boolLabel(row.consenso)} />
              <Field
                label="Consenso marketing"
                value={boolLabel(row.consenso_marketing)}
              />
            </>
          )}
          <Field label="Creato il" value={formatDateTime(row.created_at)} />
          <Field
            label="Completato il"
            value={formatDateTime(row.completed_at)}
          />
        </dl>
      </Card>

      {/* Punteggio + spider chart */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Punteggio complessivo">
          <div className="flex items-baseline gap-3">
            <span
              className="text-5xl font-extrabold"
              style={{ color: overallColor }}
            >
              {formatScore(row.overall_score)}
            </span>
            <span className="text-sm text-gray-500">/ 5.0</span>
            <span
              className="ml-2 rounded-full px-3 py-1 text-sm font-semibold"
              style={{ backgroundColor: `${overallColor}1a`, color: overallColor }}
            >
              {dash(row.overall_label)}
            </span>
          </div>

          <ul className="mt-5 space-y-2.5">
            {AXIS_KEYS.map((k) => {
              const v = axisData[k];
              const c = getLevel(v).color;
              return (
                <li key={k} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-sm text-gray-600">
                    {AXIS_LABEL[k]}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${(v / 5) * 100}%`, backgroundColor: c }}
                    />
                  </span>
                  <span
                    className="w-8 shrink-0 text-right text-sm font-semibold"
                    style={{ color: c }}
                  >
                    {v.toFixed(1)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Profilo sui 6 assi">
          <SpiderChart data={axisData} targetData={axisTarget} size={360} />
          <p className="mt-2 text-center text-xs text-gray-400">
            <span style={{ color: "#E09900" }}>■</span> attuale ·{" "}
            <span style={{ color: "#016FC0" }}>■</span> target consigliato
          </p>
        </Card>
      </div>

      {/* Compliance */}
      {row.compliance && row.compliance.length > 0 && (
        <Card>
          <ComplianceChecklist compliance={row.compliance} />
        </Card>
      )}

      {/* 30 risposte */}
      {hasAnswers && (
        <Card title="Le 30 risposte">
          <div className="space-y-6">
            {AXIS_QUESTIONS.map((axis) => (
              <div key={axis.key}>
                <h3
                  className="mb-2 text-sm font-bold"
                  style={{ color: "#016FC0" }}
                >
                  {axis.label}
                </h3>
                <ul className="space-y-2">
                  {axis.questions.map((q) => {
                    const ans = quizAnswers![q.id];
                    const opt = ans
                      ? q.options.find((o) => o.letter === ans.letter)
                      : undefined;
                    return (
                      <li
                        key={q.id}
                        className="rounded-lg border border-gray-100 p-3"
                      >
                        <p className="text-xs font-medium text-gray-500">
                          {q.id}. {q.text}
                        </p>
                        <p className="mt-1 flex items-start gap-2 text-sm text-gray-800">
                          {ans && (
                            <span
                              className="mt-0.5 shrink-0 rounded px-1.5 text-xs font-bold text-white"
                              style={{ backgroundColor: "#004172" }}
                            >
                              {ans.letter} · {ans.score}
                            </span>
                          )}
                          <span>{opt ? opt.text : "— (nessuna risposta)"}</span>
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
