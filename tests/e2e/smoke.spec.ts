import { expect, test } from "@playwright/test";

test("welcome page loads", async ({ page }) => {
  await page.goto("/welcome");
  await expect(page.getByText("Приветствуем!")).toBeVisible();
});
