// Eventi custom Plausible (GROW-1). Lo script e' caricato in layout.tsx e
// inizializza window.plausible (coda di eventi). Helper sicuro: no-op lato
// server o se window.plausible e' assente (adblock). NESSUN PII negli eventi o
// nelle props: solo nomi-step e contatori.

type PlausibleProps = Record<string, string | number | boolean>;
type PlausibleFn = (event: string, options?: { props?: PlausibleProps }) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

export function track(event: string, props?: PlausibleProps): void {
  if (typeof window === "undefined") return;
  try {
    window.plausible?.(event, props ? { props } : undefined);
  } catch {
    // Telemetria best-effort: non deve mai rompere la UX.
  }
}
