import type { Metadata } from "next";

// Tutte le pagine admin sono dinamiche (mai cache statica di dati con PII) e
// non indicizzabili dai motori di ricerca.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin · AI Readiness Assessment",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#f6f8fa]">{children}</div>;
}
