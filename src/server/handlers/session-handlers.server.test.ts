import { beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { faker } from "@faker-js/faker";

import { mockLoggedOut } from "~/test/server-utils";
import { useWebSession } from "~/server/web-session";
import type { User, UserWithoutPassword } from "~/server/db/schema";
import type { AppError } from "~/errors";

import {
  fetchUserSessions,
  invalidateCurrentSession,
  loginFn,
  revokeSession,
} from "./session-handlers";
import { hashPassword } from "../services/password-service";
import { sessions, users } from "../db/schema";
import { db } from "../db";

vi.mock("@tanstack/react-start/server", () => ({
  getRequest: () => new Request("http://localhost:3000/"),
}));
vi.mock("~/server/web-session");

function mockWebSession(user: UserWithoutPassword, sessionId?: string) {
  const mock = {
    id: "mock",
    clear: vi.fn(),
    data: { id: sessionId },
    update: vi.fn(),
    user,
  };

  vi.mocked(useWebSession).mockResolvedValue(mock);

  return mock;
}

describe("Session handlers", () => {
  let testUser: User;

  beforeEach(async () => {
    const [created] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: await hashPassword("testpassword"),
      })
      .returning();

    testUser = created;
  });

  describe("loginFn", () => {
    it("should create a session and redirect on valid credentials", async () => {
      const { update: updateSession } = mockLoggedOut();

      try {
        await loginFn({
          data: {
            email: testUser.email,
            password: "testpassword",
            redirectUrl: "/dashboard",
          },
        });
        expect.fail("Expected redirect to be thrown");
      } catch (error) {
        const response = error as Response;
        expect(response.status).toEqual(307);
      }

      const userSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, testUser.id));

      expect(userSessions).toHaveLength(1);
      expect(updateSession).toHaveBeenCalledWith({ id: userSessions[0].id });
    });

    it("should reject login with absolute redirectUrl", async () => {
      mockLoggedOut();

      await expect(
        loginFn({
          data: {
            email: testUser.email,
            password: "testpassword",
            redirectUrl: "https://evil.com",
          },
        })
      ).rejects.toThrow();
    });

    it("should throw when email does not exist", async () => {
      mockLoggedOut();

      try {
        await loginFn({
          data: {
            email: "nonexistent@example.com",
            password: "testpassword",
            redirectUrl: "",
          },
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        const appError = error as AppError;
        expect(appError.code).toBe("NOT_FOUND");
        expect(appError.message).toBe(
          "The combination of email and password is incorrect."
        );
      }
    });

    it("should throw when password is wrong", async () => {
      mockLoggedOut();

      try {
        await loginFn({
          data: {
            email: testUser.email,
            password: "wrongpassword",
            redirectUrl: "",
          },
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        const appError = error as AppError;
        expect(appError.code).toBe("NOT_FOUND");
      }
    });
  });

  describe("invalidateCurrentSession", () => {
    it("should delete the current session and clear the web session", async () => {
      const [session] = await db
        .insert(sessions)
        .values({
          userId: testUser.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .returning();

      const { clear } = mockWebSession(testUser, session.id);

      await invalidateCurrentSession();

      const fromDb = await db.query.sessions.findFirst({
        where: eq(sessions.id, session.id),
      });

      expect(fromDb).toBeUndefined();
      expect(clear).toHaveBeenCalled();
    });

    it("should only clear the web session when there is no session id", async () => {
      const { clear } = mockWebSession(testUser);

      await invalidateCurrentSession();

      expect(clear).toHaveBeenCalled();
    });
  });

  describe("fetchUserSessions", () => {
    it("should throw when no user is logged in", async () => {
      mockLoggedOut();

      try {
        await fetchUserSessions();
        expect.fail("Expected error to be thrown");
      } catch (error) {
        const appError = error as AppError;
        expect(appError.code).toBe("UNAUTHORIZED");
      }
    });
  });

  describe("revokeSession", () => {
    it("should delete a session belonging to the user", async () => {
      const futureExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const [currentSession, otherSession] = await db
        .insert(sessions)
        .values([
          { userId: testUser.id, expiresAt: futureExpiresAt },
          { userId: testUser.id, expiresAt: futureExpiresAt },
        ])
        .returning();

      mockWebSession(testUser, currentSession.id);

      await revokeSession({ data: otherSession.id });

      const fromDb = await db.query.sessions.findFirst({
        where: eq(sessions.id, otherSession.id),
      });

      expect(fromDb).toBeUndefined();
    });

    it("should throw when trying to revoke the current session", async () => {
      const [session] = await db
        .insert(sessions)
        .values({
          userId: testUser.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .returning();

      mockWebSession(testUser, session.id);

      try {
        await revokeSession({ data: session.id });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        const appError = error as AppError;
        expect(appError.code).toBe("BAD_REQUEST");
        expect(appError.message).toBe("Cannot revoke your current session");
      }
    });

    it("should throw when session does not belong to the user", async () => {
      const [otherUser] = await db
        .insert(users)
        .values({
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: await hashPassword("pass"),
        })
        .returning();

      const [otherSession] = await db
        .insert(sessions)
        .values({
          userId: otherUser.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .returning();

      mockWebSession(testUser);

      try {
        await revokeSession({ data: otherSession.id });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        const appError = error as AppError;
        expect(appError.code).toBe("NOT_FOUND");
      }
    });

    it("should throw when no user is logged in", async () => {
      mockLoggedOut();

      try {
        await revokeSession({ data: crypto.randomUUID() });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        const appError = error as AppError;
        expect(appError.code).toBe("UNAUTHORIZED");
      }
    });
  });
});
