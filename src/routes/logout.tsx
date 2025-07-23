import { redirect, createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useWebSession } from "~/server/websession";

const logoutFn = createServerFn().handler(async () => {
  const session = await useWebSession();

  session.clear();

  throw redirect({
    href: "/",
  });
});

export const Route = createFileRoute("/logout")({
  preload: false,
  loader: () => logoutFn(),
});
