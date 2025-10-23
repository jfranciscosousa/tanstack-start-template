import { faker } from "@faker-js/faker";
import { expect } from "@playwright/test";
import { verifyPassword } from "~/server/services/passwordService";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { createUserAndLogin, test, USER_TEST_PASSWORD } from "./utils";
import { waitFor } from "@playwright-testing-library/test";

function assertUserSame(user1: object, user2: object) {
  return expect(
    JSON.parse(JSON.stringify({ ...user1, password: null, updatedAt: null }))
  ).toEqual(
    JSON.parse(
      JSON.stringify({
        ...user2,
        password: null,
        updatedAt: null,
      })
    )
  );
}

test("renders profile", async ({ page, screen }) => {
  const user = await createUserAndLogin(page, screen);

  await page.goto("/profile");

  expect(page.getByText(user.name)).toBeTruthy();
  expect(page.getByText(user.email)).toBeTruthy();
});

test("updates profile", async ({ page, screen }) => {
  const user = await createUserAndLogin(page, screen);
  const newName = faker.person.firstName();
  const newEmail = faker.internet.email();
  const newPassword = faker.internet.password();

  await page.goto("/profile");
  await page.getByLabel("Full Name").fill(newName);
  await page.getByLabel("Email Address").fill(newEmail);
  await page.locator("#password").fill(newPassword);
  await page.getByLabel("Confirm New Password").fill(newPassword);
  await page.locator("#currentPassword").fill(USER_TEST_PASSWORD);
  await page.getByRole("button", { name: "Save Changes" }).click();

  await waitFor(async () => {
    await expect(
      screen.getByText("Profile updated successfully!")
    ).toBeVisible();
  });

  const [updatedUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!updatedUser) throw new Error("user should exist");

  expect(updatedUser.name).toEqual(newName);
  expect(updatedUser.email).toEqual(newEmail);
  // Check that the new password is applied
  expect(await verifyPassword(newPassword, updatedUser.password)).toBeTruthy();
});

test("does not update profile if password confirmation does not match", async ({
  page,
  screen,
}) => {
  const user = await createUserAndLogin(page, screen);
  const newPassword = faker.internet.password();

  await page.goto("/profile");
  await page.locator("#password").fill(newPassword);
  await page.getByLabel("Confirm New Password").fill(newPassword + "bad");
  await page.locator("#currentPassword").fill(USER_TEST_PASSWORD);
  await page.getByRole("button", { name: "Save Changes" }).click();

  await screen.findByText("Passwords must match");

  const [updatedUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!updatedUser) throw new Error("user should exist");

  assertUserSame(updatedUser, user);
  // Check that the old password is still valid
  expect(
    await verifyPassword(USER_TEST_PASSWORD, updatedUser.password)
  ).toBeTruthy();
});

test("does not update profile if password is bad", async ({ page, screen }) => {
  const user = await createUserAndLogin(page, screen);
  const newName = faker.person.firstName();

  await page.goto("/profile");
  await page.getByLabel("Full Name").fill(newName);
  await page.locator("#currentPassword").fill("bad_password");
  await page.getByRole("button", { name: "Save Changes" }).click();

  await screen.findByText("Your current password is wrong!");

  const [updatedUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!updatedUser) throw new Error("user should exist");

  assertUserSame(updatedUser, user);
});
