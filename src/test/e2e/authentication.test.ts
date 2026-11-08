import { faker } from "@faker-js/faker";

import {
  createUserAndLogin,
  expect,
  test,
  waitForLoadersToDisappear,
} from "./utils";

test("signs up and lands on the todos page", async ({ page }) => {
  await page.goto("/signup");
  await waitForLoadersToDisappear(page);

  await page.getByLabel("Email", { exact: true }).fill(faker.internet.email());
  await page.getByLabel("Name", { exact: true }).fill(faker.person.fullName());
  await page.getByLabel("Password", { exact: true }).fill("foobar123");
  await page.getByLabel("Confirm password", { exact: true }).fill("foobar123");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();

  await page.waitForURL("/");
});

test("logs in without rendering the authentication error boundary", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });

  await createUserAndLogin(page);

  expect(errors.filter(error => error.includes("AppError"))).toEqual([]);
});

test("shows login and then redirects to original page", async ({ page }) => {
  await createUserAndLogin(page, "/profile");

  await page.waitForURL("/profile?tab=profile");
});

test("drives profile tabs from URL state", async ({ page }) => {
  await createUserAndLogin(page, "/profile?tab=sessions");

  await page.waitForURL("/profile?tab=sessions");
  await expect(page.getByRole("tab", { name: /sessions/i })).toHaveAttribute(
    "aria-selected",
    "true"
  );

  await page.getByRole("tab", { name: "Profile" }).click();
  await page.waitForURL("/profile?tab=profile");
  await page.reload();
  await expect(page.getByRole("tab", { name: "Profile" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
});

test("logs out and drops user on login page", async ({ page }) => {
  const user = await createUserAndLogin(page);

  await page.getByLabel("Account menu").click();
  await page.getByText("Sign out", { exact: true }).click();

  await expect(page.getByText("Sign in", { exact: true })).toHaveCount(1);
  await expect(page.getByText(user.name, { exact: true })).toHaveCount(0);
});
