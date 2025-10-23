import { createServerOnlyFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { type Session, sessions, type UserWithoutPassword } from "../db/schema";

export const createSession = createServerOnlyFn(
  (
    user: UserWithoutPassword,
    {
      ipAddress,
      location,
      userAgent,
    }: Pick<Session, "ipAddress" | "userAgent" | "location">
  ) =>
    db
      .insert(sessions)
      .values({ ipAddress, location, userAgent, userId: user.id })
      .returning()
      .then(results => results[0])
);

export const getUserSessions = createServerOnlyFn((user: UserWithoutPassword) =>
  db.query.sessions.findMany({
    where: sessions => eq(sessions.userId, user.id),
  })
);

export const verifyUserSession = createServerOnlyFn(
  (user: UserWithoutPassword, sessionId: string) =>
    db.query.sessions.findFirst({
      where: sessions =>
        and(eq(sessions.userId, user.id), eq(sessions.id, sessionId)),
    })
);

export const deleteSession = createServerOnlyFn(async (sessionId: string) =>
  db.delete(sessions).where(eq(sessions.id, sessionId))
);

export const deleteAllSessions = createServerOnlyFn(
  (user: UserWithoutPassword) =>
    db.delete(sessions).where(eq(sessions.userId, user.id))
);
