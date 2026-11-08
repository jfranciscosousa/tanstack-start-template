import type { Page } from "@playwright/test";

import { expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

import { auth } from "~/lib/auth";

export const USER_TEST_PASSWORD = "foobar123";

export { expect, test } from "@playwright/test";

export async function createUserAndLogin(page: Page, originalPage?: string) {
  const password = USER_TEST_PASSWORD;
  const email = faker.internet.email({
    firstName: crypto.randomUUID().replaceAll("-", ""),
  });
  const name = faker.person.firstName();

  const { user } = await auth.api.signUpEmail({
    body: { email, name, password },
  });

  await page.goto(originalPage || "/");
  await waitForLoadersToDisappear(page);

  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByTestId(`Welcome ${name}`)).toBeVisible();

  return user;
}

export async function waitForLoadersToDisappear(page: Page) {
  await expect(page.getByTestId("loader")).toHaveCount(0);
}
