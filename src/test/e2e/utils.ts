import { faker } from "@faker-js/faker";
import { waitFor } from "@playwright-testing-library/test";
import type { Screen } from "@playwright-testing-library/test/dist/fixture/types";
import {
  locatorFixtures as fixtures,
  type LocatorFixtures as TestingLibraryFixtures,
} from "@playwright-testing-library/test/fixture.js";
import { test as base, type Page } from "@playwright/test";
import { createUser } from "~/server/services/userServices";

export const USER_TEST_PASSWORD = "foobar";

export const test = base.extend<TestingLibraryFixtures>(fixtures);
export const expect = test.expect;

export async function createUserAndLogin(
  page: Page,
  screen: Screen,
  originalPage?: string
) {
  const password = USER_TEST_PASSWORD;
  const user = await createUser({
    email: faker.internet.email({
      firstName: crypto.randomUUID().replaceAll("-", ""),
    }),
    name: faker.person.firstName(),
    password,
  });

  await page.goto(originalPage || "/");
  await waitForLoadersToDisappear(screen);

  await screen.getByLabelText("Email").fill(user.email);
  await screen.getByLabelText("Password").fill(password);
  await screen.getByText("Sign in", { selector: "button" }).click();
  await waitFor(async () => {
    await expect(screen.getByTestId(`Welcome ${user.name}`)).toBeVisible();
  });

  return user;
}

export async function waitForLoadersToDisappear(screen: Screen) {
  await waitFor(async () => {
    const loaders = await screen.findAllByTestId("loader");

    await expect(loaders).toHaveCount(0);
  });
}
