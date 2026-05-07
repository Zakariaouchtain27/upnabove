import { defineConfig, devices } from "@playwright/test";

/**
 * Base URL resolution order:
 *   1. PLAYWRIGHT_BASE_URL env var  — set in CI to point at a preview deployment
 *   2. localhost:3000               — used when running locally with `next dev`
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Give server-rendered pages time to hydrate
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Spin up `next dev` automatically when running locally.
  // Skipped in CI — CI should point PLAYWRIGHT_BASE_URL at a live deployment.
  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
