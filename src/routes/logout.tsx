import { createServerFn } from "@tanstack/react-start";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { invalidateCurrentSession } from "~/server/handlers/sessionHandlers";

const logoutFn = createServerFn().handler(async () => {
  await invalidateCurrentSession();

  throw redirect({
    href: "/",
  });
});

export const Route = createFileRoute("/logout")({
  loader: () => logoutFn(),
  preload: false,
});
