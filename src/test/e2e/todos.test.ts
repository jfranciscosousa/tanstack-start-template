import { faker } from "@faker-js/faker";
import { waitFor } from "@playwright-testing-library/test";
import type { Screen } from "@playwright-testing-library/test/dist/fixture/types";
import { expect } from "@playwright/test";
import { createUserAndLogin, test } from "./utils";

async function createNote(screen: Screen) {
  const note = faker.git.commitSha();

  await screen.getByPlaceholderText("What needs to be done?").fill(note);
  await screen.getByText("Add").click();
  await screen.findByText(note);

  return note;
}

async function getNotesLength(screen: Screen) {
  return (await screen.queryAllByText("Delete").allTextContents()).length;
}

test("creates todos", async ({ page, screen }) => {
  await createUserAndLogin(page, screen);

  const note = await createNote(screen);

  expect(await screen.getByText(note).count()).toBe(1);
});

test("deletes todos", async ({ page, screen }) => {
  await createUserAndLogin(page, screen);
  await createNote(screen);

  const notesCountBefore = await getNotesLength(screen);
  await screen.getAllByText("Delete").first().click();

  await waitFor(async () =>
    expect(await getNotesLength(screen)).toBe(notesCountBefore - 1)
  );
});

test("deletes all todos", async ({ page, screen }) => {
  await createUserAndLogin(page, screen);
  await createNote(screen);
  await createNote(screen);
  await createNote(screen);

  await screen.getByText("Delete all").click();

  await waitFor(async () => expect(await getNotesLength(screen)).toBe(0));
});
