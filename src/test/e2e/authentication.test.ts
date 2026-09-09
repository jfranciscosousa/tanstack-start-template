import { waitFor } from "@playwright-testing-library/test";
import { faker } from "@faker-js/faker";

import {
  createUserAndLogin,
  expect,
  test,
  waitForLoadersToDisappear,
} from "./utils";

test("signs up and lands on the todos page", async ({ page, screen }) => {
  await page.goto("/signup");
  await waitForLoadersToDisappear(screen);

  await screen.getByLabelText("Email").fill(faker.internet.email());
  await screen.getByLabelText("Name").fill(faker.person.fullName());
  await screen.getByLabelText("Password").fill("foobar123");
  await screen.getByLabelText("Confirm password").fill("foobar123");
  await screen.getByText("Create account", { selector: "button" }).click();

  await page.waitForURL("/");
});

test("logs in without rendering the authentication error boundary", async ({
  page,
  screen,
}) => {
  const errors: string[] = [];
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });

  await createUserAndLogin(page, screen);

  expect(errors.filter(error => error.includes("AppError"))).toEqual([]);
});

test("shows login and then redirects to original page", async ({
  page,
  screen,
}) => {
  await createUserAndLogin(page, screen, "/profile");

  await page.waitForURL("/profile?tab=profile");
});

test("drives profile tabs from URL state", async ({ page, screen }) => {
  await createUserAndLogin(page, screen, "/profile?tab=sessions");

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

test("logs out and drops user on login page", async ({ page, screen }) => {
  const user = await createUserAndLogin(page, screen);

  await page.getByLabel("Account menu").click();
  await (await screen.findByText("Sign out")).click();

  await waitFor(async () => {
    expect(await (await screen.findByText("Sign in")).count()).toBe(1);
    expect(await screen.queryByText(user.name).count()).toBe(0);
  });
});
