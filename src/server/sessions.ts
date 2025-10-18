import { redirect } from "@tanstack/react-router";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { verifyPassword } from "./passwords";
import { db } from "./db";
import { users, sessions } from "./db/schema";
import { useWebSession } from "./websession";
import { zfd } from "zod-form-data";
import z from "zod";
import { AppError } from "~/errors";
import { getRequestInfo } from "./request-info";
import { getRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";

export const loginSchema = zfd.formData({
  email: zfd.text(z.email()),
  password: zfd.text(),
  redirectUrl: zfd.text().optional(),
});

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((formData: FormData) => loginSchema.parse(formData))
  .handler(async ({ data }) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user || !(await verifyPassword(data.password, user.password))) {
      throw new AppError(
        "NOT_FOUND",
        "The combination of email and password is incorrect."
      );
    }

    await createAndUseSession(user.id);

    throw redirect({
      href: data.redirectUrl || "/",
    });
  });

/**
 * Creates a session in the database and updates the web session (cookie)
 */
export const createAndUseSession = createServerOnlyFn(
  async (userId: string) => {
    const request = getRequest();
    const { ipAddress, location, userAgent } = await getRequestInfo(request);

    const [session] = await db
      .insert(sessions)
      .values({ ipAddress, location, userAgent, userId })
      .returning();

    const webSession = await useWebSession();

    await webSession.update({
      id: session.id,
    });
  }
);

export const invalidateCurrentSession = createServerOnlyFn(async () => {
  const webSession = await useWebSession();

  if (webSession.data.id) {
    await db.delete(sessions).where(eq(sessions.id, webSession.data.id));
  }
  await webSession.clear();
});

export const invalidateAllSessions = createServerOnlyFn((userId: string) =>
  db.delete(sessions).where(eq(sessions.userId, userId))
);

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

    const userSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, webSession.user.id))
      .orderBy(sessions.updatedAt);

    return {
      sessions: userSessions,
      currentSessionId: webSession.data.id,
    };
  }
);

/**
 * Revokes a specific session
 */
export const revokeSession = createServerFn({ method: "POST" })
  .inputValidator((sessionId: string) => z.string().uuid().parse(sessionId))
  .handler(async ({ data: sessionId }) => {
    const webSession = await useWebSession();

    if (!webSession.user) {
      throw new AppError("UNAUTHORIZED", "You must be logged in");
    }

    // Verify the session belongs to the user
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!session || session.userId !== webSession.user.id) {
      throw new AppError("NOT_FOUND", "Session not found");
    }

    // Don't allow revoking the current session
    if (sessionId === webSession.data.id) {
      throw new AppError("BAD_REQUEST", "Cannot revoke your current session");
    }

    await db.delete(sessions).where(eq(sessions.id, sessionId));
  });
