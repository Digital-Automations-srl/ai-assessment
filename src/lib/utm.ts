// Attribuzione sorgente lead (UTM) — DATA-1. Modulo PURO: usato dal client
// (page.tsx legge i query param al primo load) e dal server (route → colonne
// utm_* su submissions). I valori sono sanificati (trim + cap lunghezza) sia
// lato client sia lato server.

export type UtmKey = "utm_source" | "utm_medium" | "utm_campaign" | "utm_content";

export const UTM_KEYS: UtmKey[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
];

export type UtmParams = Partial<Record<UtmKey, string>>;

const MAX_LEN = 200;

function clean(v: string | null | undefined): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, MAX_LEN);
}

/** Estrae i soli parametri utm_* (non vuoti) da una URLSearchParams. */
export function pickUtm(params: URLSearchParams): UtmParams {
  const out: UtmParams = {};
  for (const k of UTM_KEYS) {
    const v = clean(params.get(k));
    if (v) out[k] = v;
  }
  return out;
}

/**
 * Colonne DB utm_* da un UtmParams ricevuto dal client. Tutte e 4 presenti
 * (null se assenti) e ri-sanificate lato server (il client e' non fidato).
 */
export function utmColumns(
  utm: UtmParams | null | undefined
): Record<UtmKey, string | null> {
  const u = utm ?? {};
  return {
    utm_source: clean(u.utm_source),
    utm_medium: clean(u.utm_medium),
    utm_campaign: clean(u.utm_campaign),
    utm_content: clean(u.utm_content),
  };
}
