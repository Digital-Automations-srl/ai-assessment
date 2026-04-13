"use client";

import { useState } from "react";
import type { LeadData } from "@/lib/types";

interface LeadFormProps {
  onSubmit: (data: LeadData) => void;
  isSubmitting: boolean;
}

export default function LeadForm({ onSubmit, isSubmitting }: LeadFormProps) {
  const [form, setForm] = useState<LeadData>({
    nome: "",
    cognome: "",
    email: "",
    azienda: "",
    telefono: "",
    consenso: false,
  });

  const isValid =
    form.nome.trim() !== "" &&
    form.cognome.trim() !== "" &&
    form.email.trim() !== "" &&
    form.azienda.trim() !== "" &&
    form.consenso;

  const handleChange = (field: keyof LeadData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isSubmitting) {
      onSubmit(form);
    }
  };

  const inputStyle: React.CSSProperties = {
    border: "2px solid #E4E4E4",
    borderRadius: "0.5rem",
    padding: "0.75rem",
    width: "100%",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h2
        className="mb-6 text-center text-2xl font-extrabold"
        style={{ color: "#004172" }}
      >
        Ricevi il report completo
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome + Cognome */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "#333" }}>
              Nome *
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#016FC0")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E4E4E4")}
              placeholder="Mario"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "#333" }}>
              Cognome *
            </label>
            <input
              type="text"
              value={form.cognome}
              onChange={(e) => handleChange("cognome", e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#016FC0")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E4E4E4")}
              placeholder="Rossi"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: "#333" }}>
            Email aziendale *
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#016FC0")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E4E4E4")}
            placeholder="mario.rossi@azienda.it"
          />
        </div>

        {/* Azienda */}
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: "#333" }}>
            Azienda *
          </label>
          <input
            type="text"
            value={form.azienda}
            onChange={(e) => handleChange("azienda", e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#016FC0")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E4E4E4")}
            placeholder="Nome Azienda Srl"
          />
        </div>

        {/* Telefono */}
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: "#999" }}>
            Telefono (opzionale)
          </label>
          <input
            type="tel"
            value={form.telefono}
            onChange={(e) => handleChange("telefono", e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#016FC0")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E4E4E4")}
            placeholder="+39 333 1234567"
          />
        </div>

        {/* GDPR Checkbox */}
        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            id="consenso"
            checked={form.consenso}
            onChange={(e) => handleChange("consenso", e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded"
            style={{ accentColor: "#016FC0" }}
          />
          <label
            htmlFor="consenso"
            className="cursor-pointer text-xs leading-relaxed"
            style={{ color: "#666" }}
          >
            Acconsento al trattamento dei dati personali ai sensi del GDPR
            (Reg. UE 2016/679) per ricevere il report e comunicazioni relative
            al servizio. *
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full rounded-lg py-3.5 text-base font-bold text-white transition-colors"
          style={{
            backgroundColor: "#016FC0",
            opacity: isValid && !isSubmitting ? 1 : 0.4,
            cursor: isValid && !isSubmitting ? "pointer" : "not-allowed",
          }}
        >
          {isSubmitting ? "Invio in corso..." : "Invia e ricevi il report"}
        </button>
      </form>
    </div>
  );
}
