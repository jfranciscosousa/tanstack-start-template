import { createFileRoute } from "@tanstack/react-router";

import { fetchUserSessions } from "~/server/handlers/session-handlers";
import ProfilePage from "~/domains/profile/profile-page";

export const Route = createFileRoute("/_authed/profile")({
  component: ProfilePage,
  loader: () => fetchUserSessions(),
});
