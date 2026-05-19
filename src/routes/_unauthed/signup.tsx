import z from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { APP_NAME } from "~/lib/app-config.js";
import { seo } from "~/server/seo.js";
import SignupPage from "~/domains/signup/signup-page";

const searchSchema = z.object({
  redirectUrl: z.string().optional(),
});

export const Route = createFileRoute("/_unauthed/signup")({
  component: SignupPage,
  validateSearch: search => searchSchema.parse(search),
  head: () => ({
    meta: [
      ...seo({
        title: `Create Account | ${APP_NAME}`,
        description: "Create a new account",
      }),
    ],
  }),
});
