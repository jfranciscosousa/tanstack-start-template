import z from "zod";
import { createFileRoute } from "@tanstack/react-router";

import SignupPage from "~/domains/signup/signup-page";

const searchSchema = z.object({
  redirectUrl: z.string().optional(),
});

export const Route = createFileRoute("/_unauthed/signup")({
  component: SignupPage,
  validateSearch: search => searchSchema.parse(search),
});
