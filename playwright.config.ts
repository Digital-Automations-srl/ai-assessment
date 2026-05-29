import { defineConfig, devices } from "@playwright/test";

// CODE-2 — e2e del quiz pubblico. Il dev server e' avviato da Playwright; le
// route API (/api/track-result, /api/send-report) sono mockate nei test via
// page.route, quindi gli e2e NON dipendono da SMTP/Supabase.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"]],
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    headless: true,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
