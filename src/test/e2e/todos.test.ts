import type { Page } from "@playwright/test";
import type { Screen } from "@playwright-testing-library/test/dist/fixture/types";

import { expect } from "@playwright/test";
import { waitFor } from "@playwright-testing-library/test";
import { faker } from "@faker-js/faker";

import { createUserAndLogin, test } from "./utils";

async function createNote(screen: Screen) {
  const note = faker.git.commitSha();

  await screen.getByPlaceholderText("What needs to be done?").fill(note);
  await screen.getByText("Add task").click();
  await screen.findByText(note);

  return note;
}

function getNotesLength(page: Page) {
  return page.locator(".break-inside-avoid").count();
}

test("creates todos", async ({ page, screen }) => {
  await createUserAndLogin(page, screen);

  const note = await createNote(screen);

  expect(await screen.getByText(note).count()).toBe(1);
});

test("deletes todos", async ({ page, screen }) => {
  await createUserAndLogin(page, screen);
  await createNote(screen);

  const notesCountBefore = await getNotesLength(page);
  await page.locator(".break-inside-avoid button").first().click();

  await waitFor(async () =>
    expect(await getNotesLength(page)).toBe(notesCountBefore - 1)
  );
});

test("deletes all todos", async ({ page, screen }) => {
  await createUserAndLogin(page, screen);
  await createNote(screen);
  await createNote(screen);
  await createNote(screen);

  await page.getByRole("button", { name: "Clear all" }).first().click();
  await page.getByRole("button", { name: "Clear all" }).last().click();

  await waitFor(async () => expect(await getNotesLength(page)).toBe(0));
});
