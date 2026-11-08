import { eq } from "drizzle-orm";
import { expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

import { users } from "~/server/db/schema";
import { db } from "~/server/db";
import { auth } from "~/lib/auth";

import { USER_TEST_PASSWORD, createUserAndLogin, test } from "./utils";

function assertUserSame(user1: object, user2: object) {
  expect({ ...user1, password: null, updatedAt: null }).toEqual({
    ...user2,
    password: null,
    updatedAt: null,
  });
}

test("renders profile", async ({ page }) => {
  const user = await createUserAndLogin(page);

  await page.goto("/profile");

  expect(page.getByText(user.name)).toBeTruthy();
  expect(page.getByText(user.email)).toBeTruthy();
});

test("updates profile", async ({ page }) => {
  const user = await createUserAndLogin(page);
  const newName = faker.person.firstName();
  const newPassword = faker.internet.password();

  await page.goto("/profile");
  await page.getByLabel("Full Name").fill(newName);
  await page.locator("#password").fill(newPassword);
  await page
    .getByRole("textbox", { name: "Confirm New Password" })
    .fill(newPassword);
  await page.locator("#currentPassword").fill(USER_TEST_PASSWORD);
  await page.getByRole("button", { name: "Save Changes" }).click();

  await expect(page.getByText("Profile updated successfully!")).toBeVisible();

  const [updatedUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!updatedUser) {
    throw new Error("user should exist");
  }

  expect(updatedUser.name).toEqual(newName);
  // Check that the new password is applied
  expect(
    await auth.api.signInEmail({
      body: { email: user.email, password: newPassword },
    })
  ).toBeTruthy();
});

test("updates email", async ({ page }) => {
  const user = await createUserAndLogin(page);
  const newEmail = faker.internet.email({
    firstName: crypto.randomUUID().replaceAll("-", ""),
  });

  await page.goto("/profile");
  await page.getByLabel("Email Address").fill(newEmail);
  await page.locator("#currentPassword").fill(USER_TEST_PASSWORD);
  await page.getByRole("button", { name: "Save Changes" }).click();

  await expect(page.getByText("Profile updated successfully!")).toBeVisible();

  const [updatedUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!updatedUser) {
    throw new Error("user should exist");
  }

  expect(updatedUser.email).toEqual(newEmail.toLowerCase());
});

test("does not update profile if password confirmation does not match", async ({
  page,
}) => {
  const user = await createUserAndLogin(page);
  const newPassword = faker.internet.password();

  await page.goto("/profile");
  await page.locator("#password").fill(newPassword);
  await page
    .getByRole("textbox", { name: "Confirm New Password" })
    .fill(`${newPassword}bad`);
  await page.locator("#currentPassword").fill(USER_TEST_PASSWORD);
  await page.getByRole("button", { name: "Save Changes" }).click();

  await expect(page.getByText("Passwords must match")).toBeVisible();

  const [updatedUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!updatedUser) {
    throw new Error("user should exist");
  }

  assertUserSame(updatedUser, user);
  // Check that the old password is still valid
  expect(
    await auth.api.signInEmail({
      body: { email: user.email, password: USER_TEST_PASSWORD },
    })
  ).toBeTruthy();
});

test("does not update profile if password is bad", async ({ page }) => {
  const user = await createUserAndLogin(page);
  const newName = faker.person.firstName();

  await page.goto("/profile");
  await page.getByLabel("Full Name").fill(newName);
  await page.locator("#currentPassword").fill("bad_password");
  await page.getByRole("button", { name: "Save Changes" }).click();

  await expect(page.getByText("The current password is wrong")).toBeVisible();

  const [updatedUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!updatedUser) {
    throw new Error("user should exist");
  }

  assertUserSame(updatedUser, user);
});
