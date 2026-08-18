import type { Page } from "@playwright/test";
import { expect, log, test } from "./support/merged-fixtures";

const publicPages = ["/", "/collections", "/about", "/contact"] as const;

async function expectPublicNavbar(page: Page) {
  const header = page.getByTestId("site-header");
  await expect(header).toBeVisible();
  await expect(header.getByTestId("site-brand")).toContainText("نور گالری");
  await expect(header.getByTestId("admin-monogram")).toHaveCount(0);
  await expect(page.getByTestId("admin-monogram")).toHaveCount(0);
  await expect(page.locator(".cl-userButton-root")).toHaveCount(0);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth > root.clientWidth + 1;
  });
  expect(overflow).toBe(false);
}

test.describe("public site (signed-out)", () => {
  for (const path of publicPages) {
    test(`[P1] ${path} loads with wordmark and no admin monogram`, async ({ page }) => {
      await log.step(`Open ${path}`);
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expectPublicNavbar(page);
      await expectNoHorizontalOverflow(page);
    });
  }

  test("[P1] home hero shows نور گالری without admin chrome", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("hero-heading")).toBeVisible();
    await expect(page.getByTestId("hero-heading")).toContainText(/نور گالری/);
    await expect(page.getByTestId("admin-monogram")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  test("[P0] /admin redirects unauthenticated users to /sign-in", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("[P1] /sign-up redirects to /sign-in with no signup UI", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByTestId("sign-in-form")).toBeVisible();
    await expect(page.getByRole("link", { name: /sign up|ثبت.?نام|ثبت نام/i })).toHaveCount(0);
  });
});
