import { faker } from "@faker-js/faker";
import { waitFor } from "@playwright-testing-library/test";
import type { Screen } from "@playwright-testing-library/test/dist/fixture/types";
import {
  locatorFixtures as fixtures,
  type LocatorFixtures as TestingLibraryFixtures,
} from "@playwright-testing-library/test/fixture.js";
import { type Page, test as base } from "@playwright/test";
import path from "path";
import { createUser } from "~/server/users";

export const USER_TEST_PASSWORD = "foobar";

export const test = base
  .extend<TestingLibraryFixtures>(fixtures)
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  .extend<{}, { workerStorageState: string }>({
    // These two properties ensure each worker has an unique auth context
    storageState: ({ workerStorageState }, u) => u(workerStorageState),
    workerStorageState: [
      async ({ browser }, u) => {
        const id = test.info().parallelIndex;
        const fileName = path.resolve(
          test.info().project.outputDir,
          `node_modules/.cache/.auth/${id}.json`
        );
        const page = await browser.newPage({ storageState: undefined });
        await page.context().storageState({ path: fileName });
        await page.close();
        await u(fileName);
      },
      { scope: "worker" },
    ],
  });

/**
 * Truncates the database between each test
 */
// test.beforeEach(truncateAll);

export const expect = test.expect;

export async function createUserAndLogin(
  page: Page,
  screen: Screen,
  originalPage?: string
) {
  const password = USER_TEST_PASSWORD;
  const user = await createUser({
    email: faker.internet.email({ firstName: crypto.randomUUID() }),
    name: faker.person.firstName(),
    password,
    passwordConfirmation: password,
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
