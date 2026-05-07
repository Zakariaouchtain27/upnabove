import { test, expect } from "@playwright/test";

// ─────────────────────────────────────────────────────────────────────────────
// JobForge E2E — apply-flow
//
// Covers the public-facing navigation path:
//   Landing page → "Enter the Forge" → Forge arena page → challenge card
//
// All assertions target text/structure that is statically rendered by the
// server; no auth or Supabase state is required for these checks to pass.
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Landing page", () => {
  test("renders the upNabove wordmark <h1>", async ({ page }) => {
    await page.goto("/");

    // The <h1> contains two text nodes: "up" and "above" with "N" in between.
    // textContent() collapses them into one string.
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("upNabove");
  });

  test("displays the job search form", async ({ page }) => {
    await page.goto("/");
    // SearchForm renders at minimum a text input for the keyword search
    const searchInput = page.getByRole("textbox").first();
    await expect(searchInput).toBeVisible();
  });

  test("shows the 'Enter the Forge' navigation link", async ({ page }) => {
    await page.goto("/");
    const forgeLink = page.getByRole("link", { name: /enter the forge/i });
    await expect(forgeLink).toBeVisible();
    await expect(forgeLink).toHaveAttribute("href", "/forge");
  });
});

test.describe("Forge arena page", () => {
  test("navigates from landing page to Forge via the CTA link", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /enter the forge/i }).click();

    await expect(page).toHaveURL(/\/forge/);
  });

  test("renders the Forge hero <h1> without crashing", async ({ page }) => {
    await page.goto("/forge");

    // The hero h1 spans three lines:
    //   "Stop applying." / "Start forging." / "Get discovered."
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("Stop applying.");
    await expect(h1).toContainText("Start forging.");
    await expect(h1).toContainText("Get discovered.");
  });

  test("renders the 'How It Works' section heading", async ({ page }) => {
    await page.goto("/forge");

    // h2 "The Combat Loop" is always rendered regardless of DB state
    const combatLoopHeading = page.getByRole("heading", { name: /the combat loop/i });
    await expect(combatLoopHeading).toBeVisible();
  });

  test("displays all four 'How It Works' step cards", async ({ page }) => {
    await page.goto("/forge");

    const steps = ["Post a Bounty", "Compete Anonymously", "Rise on the Board", "Get Hired"];
    for (const title of steps) {
      await expect(page.getByText(title, { exact: true })).toBeVisible();
    }
  });

  test("shows challenge cards or an empty-state message in the arena", async ({ page }) => {
    await page.goto("/forge");

    // The arena renders either ChallengeCards or "No upcoming drops." / similar
    // empty-state text. Either outcome means the page loaded correctly.
    const hasCards = await page.locator("[data-testid='challenge-card']").count();
    const hasEmptyState = await page.getByText(/no upcoming drops/i).count();

    // At least one of the two states must be present
    expect(hasCards + hasEmptyState).toBeGreaterThan(0);
  });

  test("bottom CTA section is present", async ({ page }) => {
    await page.goto("/forge");

    const ctaHeading = page.getByRole("heading", { name: /ready to prove/i });
    await expect(ctaHeading).toBeVisible();
  });
});
