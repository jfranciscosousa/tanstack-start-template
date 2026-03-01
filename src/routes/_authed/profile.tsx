import { createFileRoute } from "@tanstack/react-router";

import ProfilePage from "~/domains/profile/profile-page";
import { fetchUserSessions } from "~/server/handlers/session-handlers";

export const Route = createFileRoute("/_authed/profile")({
  component: ProfilePage,
  loader: () => fetchUserSessions(),
});
