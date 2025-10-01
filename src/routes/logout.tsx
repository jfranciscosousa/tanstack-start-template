import { redirect, createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { invalidateCurrentSession } from "~/server/sessions";

const logoutFn = createServerFn().handler(async () => {
  await invalidateCurrentSession();

  throw redirect({
    href: "/",
  });
});

export const Route = createFileRoute("/logout")({
  preload: false,
  loader: () => logoutFn(),
});
