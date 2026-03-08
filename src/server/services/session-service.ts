import { and, eq } from "drizzle-orm";
import { createServerOnlyFn } from "@tanstack/react-start";

import { sessions } from "../db/schema";
import type { Session, UserWithoutPassword } from "../db/schema";
import { db } from "../db";

export const createSession = createServerOnlyFn(
  (
    user: UserWithoutPassword,
    {
      ipAddress,
      location,
      userAgent,
    }: Pick<Session, "ipAddress" | "userAgent" | "location">
  ) => {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return db
      .insert(sessions)
      .values({ expiresAt, ipAddress, location, userAgent, userId: user.id })
      .returning()
      .then(results => results[0]);
  }
);

export const getUserSessions = createServerOnlyFn((user: UserWithoutPassword) =>
  db.query.sessions.findMany({
    where: sessionsQuery => eq(sessionsQuery.userId, user.id),
  })
);

export const verifyUserSession = createServerOnlyFn(
  (user: UserWithoutPassword, sessionId: string) =>
    db.query.sessions.findFirst({
      where: sessionsQuery =>
        and(eq(sessionsQuery.userId, user.id), eq(sessionsQuery.id, sessionId)),
    })
);

export const deleteSession = createServerOnlyFn((sessionId: string) =>
  db.delete(sessions).where(eq(sessions.id, sessionId))
);

export const deleteAllSessions = createServerOnlyFn(
  (user: UserWithoutPassword) =>
    db.delete(sessions).where(eq(sessions.userId, user.id))
);
