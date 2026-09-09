import z from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { seo } from "~/server/seo.js";
import { fetchUserSessions } from "~/server/handlers/session-handlers";
import { APP_NAME } from "~/lib/app-config";
import ProfilePage from "~/domains/profile/profile-page";

const searchSchema = z.object({
  tab: z.enum(["profile", "sessions"]).default("profile"),
});

export const Route = createFileRoute("/_authed/profile")({
  component: ProfilePage,
  validateSearch: search => searchSchema.parse(search),
  loader: () => fetchUserSessions(),
  head: () => ({
    meta: [
      ...seo({
        title: `Profile | ${APP_NAME}`,
        description: "Manage your profile and sessions",
      }),
    ],
  }),
});
