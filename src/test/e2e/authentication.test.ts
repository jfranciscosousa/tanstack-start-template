import { faker } from "@faker-js/faker";
import {
  createUserAndLogin,
  expect,
  test,
  waitForLoadersToDisappear,
} from "./utils";

test("signs up", async ({ page, screen }) => {
  await page.goto("/signup");
  await waitForLoadersToDisappear(screen);

  await screen.getByLabelText("Email").fill(faker.internet.email());
  await screen.getByLabelText("Name").fill(faker.person.fullName());
  await screen.getByLabelText("Password").fill("foobar");
  await screen.getByLabelText("Confirm password").fill("foobar");
  await screen.getByText("Create account", { selector: "button" }).click();

  await page.waitForURL("/");
});

test("logins", async ({ page, screen }) => {
  await createUserAndLogin(page, screen);
});

test("shows login and then redirects to original page", async ({
  page,
  screen,
}) => {
  await createUserAndLogin(page, screen, "/profile");

  await page.waitForURL("/profile");
});

test("logs out and drops user on login page", async ({ page, screen }) => {
  const user = await createUserAndLogin(page, screen);

  await screen.getByLabel("Menu").click();
  await screen.getByText("Sign out").click();

  expect(await (await screen.findByText("Sign in")).count()).toBe(1);
  expect(await screen.queryByText(user.name).count()).toBe(0);
});
