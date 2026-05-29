// Admin auth primitives — INTENTIONALLY runtime-agnostic (Edge + Node).
// Usato sia dal middleware (Edge runtime) sia dalle route API (Node). Per
// questo NON importa `next/headers`, `node:crypto` o `Buffer`: solo Web Crypto
// e TextEncoder/btoa/atob, disponibili in entrambi i runtime.
//
// Modello: password unica (env `ADMIN_PASSWORD`). Al login si firma un cookie
// di sessione httpOnly con HMAC-SHA256; il middleware lo verifica senza DB.
// La chiave di firma e' `ADMIN_SESSION_SECRET` se presente, altrimenti la
// stessa `ADMIN_PASSWORD` (segreto condiviso comunque). Cambiare la password
// invalida automaticamente tutte le sessioni esistenti.

export const ADMIN_COOKIE = "da_admin_session";
// Durata sessione: 12 ore. Oltre, si rifa' il login.
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function getSigningSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

function bytesToB64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function strToB64url(s: string): string {
  return bytesToB64url(new TextEncoder().encode(s));
}

function b64urlToStr(s: string): string {
  let t = s.replace(/-/g, "+").replace(/_/g, "/");
  while (t.length % 4) t += "=";
  const bin = atob(t);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// Confronto a tempo (quasi) costante tra due stringhe gia' di lunghezza simile.
// Non sostituisce timingSafeEqual nativo, ma evita la early-exit del confronto
// `===` su segreti corti come questi.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return bytesToB64url(new Uint8Array(sig));
}

/** Verifica la password admin in modo costante nel tempo. */
export function verifyPassword(input: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof input !== "string" || !input) return false;
  return safeEqual(input, expected);
}

/** Firma un nuovo token di sessione (payload = scadenza). Lancia se manca il segreto. */
export async function signSession(now: number): Promise<string> {
  const secret = getSigningSecret();
  if (!secret) throw new Error("ADMIN secret non configurato");
  const payload = strToB64url(JSON.stringify({ exp: now + SESSION_TTL_MS }));
  const sig = await hmac(payload, secret);
  return `${payload}.${sig}`;
}

/** Verifica firma + scadenza di un token di sessione. Nessun accesso al DB. */
export async function verifySession(
  token: string | undefined,
  now: number
): Promise<boolean> {
  const secret = getSigningSecret();
  if (!secret || !token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmac(payload, secret);
  if (!safeEqual(sig, expected)) return false;
  try {
    const parsed = JSON.parse(b64urlToStr(payload)) as { exp?: number };
    return typeof parsed.exp === "number" && now <= parsed.exp;
  } catch {
    return false;
  }
}
