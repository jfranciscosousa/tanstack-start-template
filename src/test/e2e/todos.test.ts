import type { Page } from "@playwright/test";

import { faker } from "@faker-js/faker";

import { createUserAndLogin, expect, test } from "./utils";

function getNotes(page: Page) {
  return page.locator(".break-inside-avoid");
}

async function createNote(page: Page) {
  const note = faker.git.commitSha();

  await page.getByPlaceholder("What needs to be done?").fill(note);
  await page.getByText("Add task", { exact: true }).click();
  await expect(page.getByText(note, { exact: true })).toBeVisible();

  return note;
}

test("creates todos", async ({ page }) => {
  await createUserAndLogin(page);

  const note = await createNote(page);

  await expect(page.getByText(note, { exact: true })).toHaveCount(1);
});

test("deletes todos", async ({ page }) => {
  await createUserAndLogin(page);
  await createNote(page);

  const notesCountBefore = await getNotes(page).count();
  await page.locator(".break-inside-avoid button").first().click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();

  await expect(getNotes(page)).toHaveCount(notesCountBefore - 1);
});

test("deletes all todos", async ({ page }) => {
  await createUserAndLogin(page);
  await createNote(page);
  await createNote(page);
  await createNote(page);

  await page.getByRole("button", { name: "Clear all" }).first().click();
  await page.getByRole("button", { name: "Clear all" }).last().click();

  await expect(getNotes(page)).toHaveCount(0);
});
