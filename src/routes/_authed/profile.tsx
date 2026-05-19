import { createFileRoute } from "@tanstack/react-router";

import { APP_NAME } from "~/lib/app-config.js";
import { seo } from "~/server/seo.js";
import { fetchUserSessions } from "~/server/handlers/session-handlers";
import ProfilePage from "~/domains/profile/profile-page";

export const Route = createFileRoute("/_authed/profile")({
  component: ProfilePage,
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
