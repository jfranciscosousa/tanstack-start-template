import z from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";

import { AppError } from "~/errors";
import { loginSchema } from "~/schemas/session-schemas";

import { useWebSession } from "../web-session";
import { getUserByEmail } from "../services/user-services";
import {
  createSession,
  deleteSession,
  getUserSessions,
  verifyUserSession,
} from "../services/session-service";
import { verifyPassword } from "../services/password-service";
import { getRequestInfo } from "../request-info";
import type { User } from "../db/schema";

export { loginSchema };

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((data) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await getUserByEmail(data.email);

    if (!user || !(await verifyPassword(data.password, user.password))) {
      throw new AppError(
        "NOT_FOUND",
        "The combination of email and password is incorrect."
      );
    }

    await createAndUseSession(user);

    throw redirect({
      href: data.redirectUrl || "/",
    });
  });

/**
 * Creates a session in the database and updates the web session (cookie)
 */
export const createAndUseSession = createServerOnlyFn(async (user: User) => {
  const request = getRequest();
  const session = await createSession(user, await getRequestInfo(request));
  const webSession = await useWebSession();

  await webSession.update({
    id: session.id,
  });
});

export const invalidateCurrentSession = createServerOnlyFn(async () => {
  const webSession = await useWebSession();

  if (webSession.data.id) {
    await deleteSession(webSession.data.id);
  }

  await webSession.clear();
});

/**
 * Fetches all sessions for the current user
 */
export const fetchUserSessions = createServerFn({ method: "GET" }).handler(
  async () => {
    const webSession = await useWebSession();

    if (!webSession.user) {
      throw new AppError(
        "UNAUTHORIZED",
        "You must be logged in to view sessions"
      );
    }

    const userSessions = await getUserSessions(webSession.user);

    return {
      currentSessionId: webSession.data.id,
      sessions: userSessions,
    };
  }
);

/**
 * Revokes a specific session
 */
export const revokeSession = createServerFn({ method: "POST" })
  .inputValidator((sessionId: string) => z.uuid().parse(sessionId))
  .handler(async ({ data: sessionId }) => {
    const webSession = await useWebSession();

    if (!webSession.user) {
      throw new AppError("UNAUTHORIZED", "You must be logged in");
    }

    // Verify the session belongs to the user
    const session = await verifyUserSession(webSession.user, sessionId);

    if (!session) {
      throw new AppError("NOT_FOUND", "Session not found");
    }

    // Don't allow revoking the current session
    if (sessionId === webSession.data.id) {
      throw new AppError("BAD_REQUEST", "Cannot revoke your current session");
    }

    await deleteSession(session.id);
  });
