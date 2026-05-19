import z from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { APP_NAME } from "~/lib/app-config.js";
import { seo } from "~/server/seo.js";
import LoginPage from "~/domains/login/login-page";

const searchSchema = z.object({
  redirectUrl: z.string().optional(),
});

export const Route = createFileRoute("/_unauthed/login")({
  component: LoginPage,
  validateSearch: search => searchSchema.parse(search),
  head: () => ({
    meta: [
      ...seo({
        title: `Sign In | ${APP_NAME}`,
        description: "Sign in to your account",
      }),
    ],
  }),
});
