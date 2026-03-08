import { beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import { createTestUser } from "~/test/server-utils";
import type { UserWithoutPassword } from "~/server/db/schema";

import {
  createSession,
  deleteAllSessions,
  deleteSession,
  getUserSessions,
  verifyUserSession,
} from "./session-service";
import { sessions } from "../db/schema";
import { db } from "../db";

const requestInfo = {
  ipAddress: "192.168.1.1",
  location: "New York, US",
  userAgent: "Mozilla/5.0 (Windows NT 10.0)",
};

function futureExpiresAt() {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

describe("Session service", () => {
  let testUser: UserWithoutPassword;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  describe("createSession", () => {
    it("should persist the session in the database", async () => {
      const session = await createSession(testUser, requestInfo);

      expect(session.userId).toBe(testUser.id);
      expect(session.ipAddress).toBe(requestInfo.ipAddress);
      expect(session.location).toBe(requestInfo.location);
      expect(session.userAgent).toBe(requestInfo.userAgent);

      const fromDb = await db.query.sessions.findFirst({
        where: eq(sessions.id, session.id),
      });

      if (!fromDb) throw new Error("fromDb should exist");
      expect(fromDb.userId).toBe(testUser.id);
    });

    it("should set expiresAt approximately 30 days in the future", async () => {
      const before = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 - 5000);
      const session = await createSession(testUser, requestInfo);
      const after = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 5000);

      expect(session.expiresAt).toBeInstanceOf(Date);
      expect(session.expiresAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(session.expiresAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("getUserSessions", () => {
    it("should return empty array when user has no sessions", async () => {
      const result = await getUserSessions(testUser);

      expect(result).toEqual([]);
    });

    it("should return all sessions for the user", async () => {
      await db.insert(sessions).values([
        {
          userId: testUser.id,
          userAgent: "Browser 1",
          expiresAt: futureExpiresAt(),
        },
        {
          userId: testUser.id,
          userAgent: "Browser 2",
          expiresAt: futureExpiresAt(),
        },
      ]);

      const result = await getUserSessions(testUser);

      expect(result).toHaveLength(2);
    });

    it("should only return sessions belonging to the requesting user", async () => {
      const otherUser = await createTestUser();

      await db.insert(sessions).values([
        {
          userId: testUser.id,
          userAgent: "My browser",
          expiresAt: futureExpiresAt(),
        },
        {
          userId: otherUser.id,
          userAgent: "Other browser",
          expiresAt: futureExpiresAt(),
        },
      ]);

      const result = await getUserSessions(testUser);

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(testUser.id);
    });
  });

  describe("verifyUserSession", () => {
    it("should return the session when it belongs to the user", async () => {
      const [created] = await db
        .insert(sessions)
        .values({ userId: testUser.id, expiresAt: futureExpiresAt() })
        .returning();

      const session = await verifyUserSession(testUser, created.id);

      if (!session) throw new Error("session should exist");
      expect(session.id).toBe(created.id);
    });

    it("should return undefined when the session does not exist", async () => {
      const result = await verifyUserSession(testUser, crypto.randomUUID());

      expect(result).toBeUndefined();
    });

    it("should return undefined when the session belongs to a different user", async () => {
      const otherUser = await createTestUser();
      const [otherSession] = await db
        .insert(sessions)
        .values({ userId: otherUser.id, expiresAt: futureExpiresAt() })
        .returning();

      const result = await verifyUserSession(testUser, otherSession.id);

      expect(result).toBeUndefined();
    });
  });

  describe("deleteSession", () => {
    it("should delete the session from the database", async () => {
      const [created] = await db
        .insert(sessions)
        .values({ userId: testUser.id, expiresAt: futureExpiresAt() })
        .returning();

      await deleteSession(created.id);

      const fromDb = await db.query.sessions.findFirst({
        where: eq(sessions.id, created.id),
      });

      expect(fromDb).toBeUndefined();
    });

    it("should not affect other sessions", async () => {
      const [toDelete, toKeep] = await db
        .insert(sessions)
        .values([
          { userId: testUser.id, expiresAt: futureExpiresAt() },
          { userId: testUser.id, expiresAt: futureExpiresAt() },
        ])
        .returning();

      await deleteSession(toDelete.id);

      const fromDb = await db.query.sessions.findFirst({
        where: eq(sessions.id, toKeep.id),
      });

      expect(fromDb).toBeDefined();
    });
  });

  describe("deleteAllSessions", () => {
    it("should delete all sessions for the user", async () => {
      await db.insert(sessions).values([
        { userId: testUser.id, expiresAt: futureExpiresAt() },
        { userId: testUser.id, expiresAt: futureExpiresAt() },
        { userId: testUser.id, expiresAt: futureExpiresAt() },
      ]);

      await deleteAllSessions(testUser);

      const remaining = await getUserSessions(testUser);

      expect(remaining).toHaveLength(0);
    });

    it("should not delete sessions belonging to other users", async () => {
      const otherUser = await createTestUser();

      await db.insert(sessions).values([
        { userId: testUser.id, expiresAt: futureExpiresAt() },
        { userId: otherUser.id, expiresAt: futureExpiresAt() },
      ]);

      await deleteAllSessions(testUser);

      const otherSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, otherUser.id));

      expect(otherSessions).toHaveLength(1);
    });
  });
});
