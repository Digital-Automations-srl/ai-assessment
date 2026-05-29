"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DIPENDENTI_OPTIONS,
  RUOLO_OPTIONS,
  SETTORE_OPTIONS,
  type SubmissionFilters,
} from "@/lib/admin/types";

const selectCls =
  "rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#016FC0]";
const inputCls = selectCls;

// Preset "Segmenti commerciali" (US-2): mappano parametri querystring esistenti
// + il parametro derivato `tier`. Click → applica, sostituendo i filtri.
//
// Due strategie di filtro, intenzionalmente diverse a seconda del segmento:
//  - `tier` (hot/warm): metrica DERIVATA da computeLeadTier; il restringimento
//    SQL e' parziale e viene raffinato in memoria (vedi IMPLEMENTATION_NOTES.md).
//  - `status` (anonymous): colonna DB diretta. "Da ricontattare" = chi NON ha
//    inviato il form, quindi e' una proprieta' di stato, non un tier. Filtrare
//    per `tier:cold` sarebbe piu' ampio (include anche completati a maturita'
//    bassa o senza email): qui vogliamo proprio i soli record anonimi.
type Preset = {
  id: string;
  label: string;
  params: Partial<Record<string, string>>;
};
const PRESETS: Preset[] = [
  { id: "hot", label: "🔥 Hot leads", params: { tier: "hot" } }, // derivato
  { id: "warm", label: "🟡 Warm", params: { tier: "warm" } }, // derivato
  // Da ricontattare: filtro su `status` (colonna DB), non su tier — vedi sopra.
  { id: "recontact", label: "↩︎ Da ricontattare", params: { status: "anonymous" } },
  // Quick win: lead caldi ma senza consenso marketing → tier warm (regola US-1)
  { id: "quickwin", label: "⚡ Quick win", params: { tier: "warm", status: "completed" } },
];

function presetIsActive(p: Preset, filters: SubmissionFilters): boolean {
  const f = filters as unknown as Record<string, unknown>;
  return Object.entries(p.params).every(([k, v]) => f[k] === v);
}

export default function FilterBar({ filters }: { filters: SubmissionFilters }) {
  const router = useRouter();
  const [q, setQ] = useState(filters.search ?? "");
  const [status, setStatus] = useState(filters.status ?? "");
  const [settore, setSettore] = useState(filters.settore ?? "");
  const [dipendenti, setDipendenti] = useState(filters.dipendenti ?? "");
  const [ruolo, setRuolo] = useState(filters.ruolo ?? "");
  const [dateFrom, setDateFrom] = useState(filters.dateFrom ?? "");
  const [dateTo, setDateTo] = useState(filters.dateTo ?? "");

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (status) sp.set("status", status);
    if (settore) sp.set("settore", settore);
    if (dipendenti) sp.set("dipendenti", dipendenti);
    if (ruolo) sp.set("ruolo", ruolo);
    // mantieni il tier eventualmente attivo da un preset
    if (filters.tier) sp.set("tier", filters.tier);
    if (dateFrom) sp.set("dateFrom", dateFrom);
    if (dateTo) sp.set("dateTo", dateTo);
    // mantieni ordinamento corrente; azzera la pagina
    if (filters.sort && filters.sort !== "created_at") sp.set("sort", filters.sort);
    if (filters.dir && filters.dir !== "desc") sp.set("dir", filters.dir);
    const qs = sp.toString();
    router.push(qs ? `/admin?${qs}` : "/admin");
  }

  function applyPreset(p: Preset) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(p.params)) if (v) sp.set(k, v);
    const qs = sp.toString();
    router.push(qs ? `/admin?${qs}` : "/admin");
  }

  function reset() {
    setQ("");
    setStatus("");
    setSettore("");
    setDipendenti("");
    setRuolo("");
    setDateFrom("");
    setDateTo("");
    // azzera anche tier (US-2)
    router.push("/admin");
  }

  return (
   <div className="space-y-3">
    {/* Segmenti commerciali (US-2): preset rapidi */}
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white px-4 py-3 ring-1 ring-black/5">
      <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Segmenti
      </span>
      {PRESETS.map((p) => {
        const active = presetIsActive(p, filters);
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p)}
            className="rounded-full px-3 py-1 text-xs font-semibold transition"
            style={
              active
                ? { backgroundColor: "#016FC0", color: "#fff" }
                : { backgroundColor: "#eef4f9", color: "#016FC0" }
            }
          >
            {p.label}
          </button>
        );
      })}
    </div>

    <form
      onSubmit={apply}
      className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 ring-1 ring-black/5"
    >
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">Ricerca</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="nome, azienda, email…"
          className={`${inputCls} w-56`}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">Stato</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={selectCls}
        >
          <option value="">Tutti</option>
          <option value="completed">Completati</option>
          <option value="anonymous">Anonimi</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">Settore</span>
        <select
          value={settore}
          onChange={(e) => setSettore(e.target.value)}
          className={selectCls}
        >
          <option value="">Tutti</option>
          {SETTORE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">Dimensione</span>
        <select
          value={dipendenti}
          onChange={(e) => setDipendenti(e.target.value)}
          className={selectCls}
        >
          <option value="">Tutte</option>
          {DIPENDENTI_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">Ruolo</span>
        <select
          value={ruolo}
          onChange={(e) => setRuolo(e.target.value)}
          className={selectCls}
        >
          <option value="">Tutti</option>
          {RUOLO_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">Dal</span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className={inputCls}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">Al</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className={inputCls}
        />
      </label>

      <button
        type="submit"
        className="rounded-lg px-4 py-1.5 text-sm font-semibold text-white"
        style={{ backgroundColor: "#016FC0" }}
      >
        Filtra
      </button>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
      >
        Azzera
      </button>
    </form>
   </div>
  );
}
