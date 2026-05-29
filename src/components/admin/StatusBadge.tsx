import type { SubmissionStatus } from "@/lib/admin/types";

const MAP: Record<string, { label: string; bg: string; fg: string }> = {
  completed: { label: "Completato", bg: "#f0fdf4", fg: "#16a34a" },
  anonymous: { label: "Anonimo", bg: "#f1f5f9", fg: "#64748b" },
};

export default function StatusBadge({
  status,
}: {
  status: SubmissionStatus | string;
}) {
  const s = MAP[status] ?? { label: status, bg: "#f1f5f9", fg: "#64748b" };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: s.fg }}
      />
      {s.label}
    </span>
  );
}
