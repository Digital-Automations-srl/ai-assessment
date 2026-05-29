import { test, expect, type Page } from "@playwright/test";

// e2e del quiz pubblico (CODE-2): happy path + 2 abbandoni (step contesto e
// step risultati). Le API sono mockate a livello di rete: gli e2e verificano il
// flusso UI e il funnel di cattura, senza toccare SMTP/Supabase.

// Contatori delle chiamate alle API intercettate.
function setupApiMocks(page: Page) {
  const calls = { track: 0, send: 0 };
  page.route("**/api/track-result", async (route) => {
    calls.track += 1;
    await route.fulfill({ status: 200, json: { ok: true } });
  });
  page.route("**/api/send-report", async (route) => {
    calls.send += 1;
    await route.fulfill({ status: 200, json: { success: true } });
  });
  // Niente chiamate esterne a Plausible negli e2e.
  page.route(/plausible\.io/, (route) => route.abort());
  return calls;
}

// Risponde alla prima opzione di ogni domanda presente nella pagina corrente.
async function answerAllVisibleQuestions(page: Page) {
  const cards = page.locator(".rounded-xl.border-2");
  const n = await cards.count();
  for (let i = 0; i < n; i++) {
    await cards.nth(i).getByRole("button").first().click();
  }
}

// Dalla landing fino allo step "results" compreso (30 risposte + 3 contesto).
async function completeQuizToResults(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Inizia il quiz gratuito" }).click();
  await page.getByRole("button", { name: "Ho capito, iniziamo" }).click();

  // Step contesto (3 domande).
  await expect(
    page.getByText("Prima di iniziare, raccontaci della tua azienda")
  ).toBeVisible();
  await answerAllVisibleQuestions(page);
  await page.getByRole("button", { name: "Avanti" }).click();

  // 6 assi: ancoriamo ogni pagina al testo "Asse N di 6" del ProgressBar.
  for (let axis = 1; axis <= 6; axis++) {
    await expect(page.getByText(`Asse ${axis} di 6`)).toBeVisible();
    await answerAllVisibleQuestions(page);
    await page.getByRole("button", { name: "Avanti" }).click();
  }

  await expect(page.getByText("Il tuo profilo AI Readiness")).toBeVisible();
}

test("happy path: completa il quiz e invia il lead", async ({ page }) => {
  const calls = setupApiMocks(page);

  await completeQuizToResults(page);

  // Allo step results parte la cattura anonima (track-result).
  await expect.poll(() => calls.track).toBe(1);
  expect(calls.send).toBe(0);

  await page.getByRole("button", { name: "Ottieni il report gratuito" }).click();

  // Lead form: campi obbligatori + due consensi. exact per non far collidere
  // "Mario"/"Rossi" col placeholder email "mario.rossi@azienda.it".
  await page.getByPlaceholder("Mario", { exact: true }).fill("Mara");
  await page.getByPlaceholder("Rossi", { exact: true }).fill("Verdi");
  await page.getByPlaceholder("mario.rossi@azienda.it").fill("mara@acme.it");
  await page.getByPlaceholder("Nome Azienda Srl").fill("Acme Srl");
  await page.locator("#consenso").check();
  await page.locator("#consensoMarketing").check();
  await page.getByRole("button", { name: "Invia e ricevi il report" }).click();

  // Report mostrato dopo l'invio (send-report mockato a success).
  await expect(page.getByText(/Report AI Readiness/)).toBeVisible();
  await expect.poll(() => calls.send).toBe(1);
});

test("abbandono allo step contesto: nessuna cattura", async ({ page }) => {
  const calls = setupApiMocks(page);

  await page.goto("/");
  await page.getByRole("button", { name: "Inizia il quiz gratuito" }).click();
  await page.getByRole("button", { name: "Ho capito, iniziamo" }).click();

  // Siamo allo step contesto e ce ne andiamo: la cattura anonima (track-result)
  // avviene SOLO allo step results → qui non deve partire nulla.
  await expect(
    page.getByText("Prima di iniziare, raccontaci della tua azienda")
  ).toBeVisible();
  // Piccola attesa per intercettare eventuali chiamate spurie.
  await page.waitForTimeout(500);
  expect(calls.track).toBe(0);
  expect(calls.send).toBe(0);
});

test("abbandono allo step risultati: cattura anonima ma nessun lead", async ({
  page,
}) => {
  const calls = setupApiMocks(page);

  await completeQuizToResults(page);

  // La cattura anonima e' partita...
  await expect.poll(() => calls.track).toBe(1);
  // ...ma l'utente non invia il form → nessun send-report.
  await page.waitForTimeout(500);
  expect(calls.send).toBe(0);
});
