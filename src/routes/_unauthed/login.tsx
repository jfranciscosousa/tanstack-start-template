import z from "zod";
import { createFileRoute } from "@tanstack/react-router";

import LoginPage from "~/domains/login/login-page";

const searchSchema = z.object({
  redirectUrl: z.string().optional(),
});

export const Route = createFileRoute("/_unauthed/login")({
  component: LoginPage,
  validateSearch: (search) => searchSchema.parse(search),
});
