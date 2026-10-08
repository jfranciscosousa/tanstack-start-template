#!/usr/bin/env -S bun --preload zx/globals

import { spawnSync } from "node:child_process";

import { loadEnv } from "./helpers/env.ts";

await loadEnv();

const origin = process.env.BETTER_AUTH_URL;
const appUrl = origin && new URL(origin);
if (
  !appUrl ||
  !["http:", "https:"].includes(appUrl.protocol) ||
  !["localhost", "127.0.0.1"].includes(appUrl.hostname) ||
  appUrl.origin !== origin
) {
  throw new Error("BETTER_AUTH_URL must be the origin of a running local app");
}
if (!process.env.AGENT_BROWSER_SESSION) {
  throw new Error("Set AGENT_BROWSER_SESSION before running browser:auth");
}

const email = process.env.BROWSER_AUTH_EMAIL;
const password = process.env.BROWSER_AUTH_PASSWORD;
if (Boolean(email) !== Boolean(password)) {
  throw new Error("Set both BROWSER_AUTH_EMAIL and BROWSER_AUTH_PASSWORD");
}

const existingUser = Boolean(email);
function browserCommand(args: string[]) {
  const result = spawnSync("agent-browser", ["batch", "--bail"], {
    input: JSON.stringify([args]),
    stdio: ["pipe", "ignore", "ignore"],
  });
  if (result.status !== 0) {
    throw new Error("agent-browser cookie operation failed");
  }
}

browserCommand([
  "cookies",
  "set",
  appUrl.protocol === "https:"
    ? "__Secure-better-auth.session_token"
    : "better-auth.session_token",
  "",
  "--url",
  origin,
  "--httpOnly",
  "--expires",
  "1",
  ...(appUrl.protocol === "https:" ? ["--secure"] : []),
]);

const response = await fetch(
  `${origin}/api/auth/${existingUser ? "sign-in" : "sign-up"}/email`,
  {
    method: "POST",
    redirect: "error",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(
      existingUser
        ? { email, password }
        : {
            email: `browser-${crypto.randomUUID()}@example.test`,
            name: "Browser self-test",
            password: crypto.randomUUID() + crypto.randomUUID(),
          }
    ),
  }
);
if (!response.ok) throw new Error(`Authentication failed: ${response.status}`);

const sessionCookie = response.headers
  .getSetCookie()
  .find(cookie => /^(?:__Secure-)?better-auth\.session_token=/.test(cookie));
if (!sessionCookie) {
  throw new Error("Authentication did not issue a session cookie");
}

const [name, value] = sessionCookie.split(";", 1)[0].split("=");
if (!name || !value) throw new Error("Invalid session cookie");

browserCommand([
  "cookies",
  "set",
  name,
  value,
  "--url",
  origin,
  "--httpOnly",
  ...(sessionCookie.includes("; Secure") ? ["--secure"] : []),
]);

console.log(`Authenticated agent-browser session for ${origin}`);
