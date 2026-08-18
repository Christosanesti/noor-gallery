import { expect, log, test } from "./support/merged-fixtures";

const adminEmail = process.env.AUTH_ADMIN_EMAIL ?? "navophoto@protonmail.com";
const adminPassword = process.env.AUTH_ADMIN_PASSWORD ?? "12345678";

test.describe("admin credentials auth", () => {
  test("[P0] valid credentials reach /admin with monogram", async ({ page }) => {
    await log.step("Open sign-in");
    await page.goto("/sign-in");
    await expect(page.getByTestId("sign-in-form")).toBeVisible();
    await expect(page.getByTestId("admin-monogram")).toBeVisible();

    await log.step("Submit admin credentials");
    await page.getByTestId("sign-in-email").fill(adminEmail);
    await page.getByTestId("sign-in-password").fill(adminPassword);
    await page.getByTestId("sign-in-submit").click();

    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByTestId("admin-sidebar")).toBeVisible();
    await expect(page.getByTestId("admin-monogram")).toBeVisible();
    await expect(page.getByText("پنل مدیریت")).toBeVisible();
  });

  test("[P0] wrong password stays on sign-in", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByTestId("sign-in-email").fill(adminEmail);
    await page.getByTestId("sign-in-password").fill("wrong-password");
    await page.getByTestId("sign-in-submit").click();

    await expect(page.getByTestId("sign-in-error")).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByTestId("admin-sidebar")).toHaveCount(0);
  });
});
