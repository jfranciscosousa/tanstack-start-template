import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { eq } from "drizzle-orm";
import { faker } from "@faker-js/faker";

import { mockLoggedIn, mockLoggedOut } from "~/test/server-utils";
import type { User } from "~/server/db/schema";
import type { AppError } from "~/errors";

import { signupFn, updateUserFn } from "./user-handlers";
import { hashPassword, verifyPassword } from "../services/password-service";
import { sessions, users } from "../db/schema";
import { db } from "../db";

vi.mock("@tanstack/react-start/server", () => ({
  getRequest: () => new Request("http://localhost:3000/"),
}));
vi.mock("~/server/web-session");

describe("User schemas integration tests", () => {
  describe("signupFn", () => {
    it("should create a user with its given params", async () => {
      const { update: updateSession } = mockLoggedOut();
      const testData = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.internet.password(),
        passwordConfirmation: "",
        redirectUrl: "/dashboard",
      };
      testData.passwordConfirmation = testData.password;

      // Test that the function creates a user (it will throw a redirect, which is expected)
      try {
        await signupFn({ data: testData });
      } catch (error) {
        // The function throws a redirect, which is expected behavior
        expect(error).toBeDefined();
        const request = error as Response;
        expect(request.status).toEqual(307);
      }

      // Verify user was actually created in the database
      const createdUser = await db.query.users.findFirst({
        where: eq(users.email, testData.email),
      });

      if (!createdUser) throw new Error("created user should exist");
      expect(createdUser.name).toBe(testData.name);
      expect(createdUser.email).toBe(testData.email);
      expect(createdUser.id).toBeDefined();
      expect(createdUser.createdAt).toBeInstanceOf(Date);
      expect(createdUser.updatedAt).toBeInstanceOf(Date);

      const userSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, createdUser.id));

      expect(updateSession).toBeCalledWith({
        id: userSessions[0].id,
      });

      // Verify password was hashed correctly
      const isPasswordValid = await verifyPassword(
        testData.password,
        createdUser.password
      );
      expect(isPasswordValid).toBeTruthy();
    });
  });

  describe("updateUserFn", () => {
    let testUser: User;
    let updateSession: Mock;

    beforeEach(async () => {
      const [createdUser] = await db
        .insert(users)
        .values({
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: await hashPassword("originalpass123"),
        })
        .returning();

      testUser = createdUser;
      updateSession = mockLoggedIn(testUser).update;
    });

    it("should update user profile without changing password", async () => {
      const futureExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      // Create multiple sessions for the user
      const initialSessions = await db
        .insert(sessions)
        .values([
          {
            id: crypto.randomUUID(),
            userId: testUser.id,
            expiresAt: futureExpiresAt,
          },
          {
            id: crypto.randomUUID(),
            userId: testUser.id,
            expiresAt: futureExpiresAt,
          },
          {
            id: crypto.randomUUID(),
            userId: testUser.id,
            expiresAt: futureExpiresAt,
          },
        ])
        .returning();

      await updateUserFn({
        data: {
          name: "Updated Name",
          email: faker.internet.email(),
          currentPassword: "originalpass123",
          password: "",
          passwordConfirmation: "",
        },
      });

      // Verify sessions remain in database when password is not changed
      const remainingSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, testUser.id));
      expect(remainingSessions).toHaveLength(3);
      expect(remainingSessions.map(session => session.id).sort()).toEqual(
        initialSessions.map(session => session.id).sort()
      );
    });

    it("should update user profile with new password and invalidate all sessions (except current one)", async () => {
      const futureExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      // Create multiple sessions for the user
      await db.insert(sessions).values([
        {
          id: crypto.randomUUID(),
          userId: testUser.id,
          expiresAt: futureExpiresAt,
        },
        {
          id: crypto.randomUUID(),
          userId: testUser.id,
          expiresAt: futureExpiresAt,
        },
        {
          id: crypto.randomUUID(),
          userId: testUser.id,
          expiresAt: futureExpiresAt,
        },
      ]);

      await updateUserFn({
        data: {
          name: "Updated Name",
          email: faker.internet.email(),
          currentPassword: "originalpass123",
          password: "newpassword123",
          passwordConfirmation: "newpassword123",
        },
      });

      // Verify old sessions are deleted and only the current session remains
      const remainingSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, testUser.id));
      expect(remainingSessions).toHaveLength(1);

      const [session] = remainingSessions;
      // Check that the web session was updated with the session id
      expect(updateSession).toBeCalledWith({ id: session.id });
    });

    it("should throw error when no user is logged in", async () => {
      mockLoggedOut();

      try {
        await updateUserFn({
          data: {
            name: "Updated Name",
            email: "updated@test.com",
            currentPassword: "originalpass123",
            password: "",
            passwordConfirmation: "",
          },
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        const appError = error as AppError;

        expect(appError.code).toBe("NOT_FOUND");
        expect(appError.message).toBe("The requested resource was not found.");
      }
    });
  });
});
