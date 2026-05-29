"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DIPENDENTI_OPTIONS,
  SETTORE_OPTIONS,
  type SubmissionFilters,
} from "@/lib/admin/types";

const selectCls =
  "rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#016FC0]";
const inputCls = selectCls;

export default function FilterBar({ filters }: { filters: SubmissionFilters }) {
  const router = useRouter();
  const [q, setQ] = useState(filters.search ?? "");
  const [status, setStatus] = useState(filters.status ?? "");
  const [settore, setSettore] = useState(filters.settore ?? "");
  const [dipendenti, setDipendenti] = useState(filters.dipendenti ?? "");
  const [dateFrom, setDateFrom] = useState(filters.dateFrom ?? "");
  const [dateTo, setDateTo] = useState(filters.dateTo ?? "");

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (status) sp.set("status", status);
    if (settore) sp.set("settore", settore);
    if (dipendenti) sp.set("dipendenti", dipendenti);
    if (dateFrom) sp.set("dateFrom", dateFrom);
    if (dateTo) sp.set("dateTo", dateTo);
    // mantieni ordinamento corrente; azzera la pagina
    if (filters.sort && filters.sort !== "created_at") sp.set("sort", filters.sort);
    if (filters.dir && filters.dir !== "desc") sp.set("dir", filters.dir);
    const qs = sp.toString();
    router.push(qs ? `/admin?${qs}` : "/admin");
  }

  function reset() {
    setQ("");
    setStatus("");
    setSettore("");
    setDipendenti("");
    setDateFrom("");
    setDateTo("");
    router.push("/admin");
  }

  return (
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
  );
}
