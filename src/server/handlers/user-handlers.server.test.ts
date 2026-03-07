import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { faker } from "@faker-js/faker";

import { mockLoggedIn, mockLoggedOut } from "~/test/server-utils";
import type { User } from "~/server/db/schema";
import { AppError, ParamsError } from "~/errors";

import { hashPassword, verifyPassword } from "../services/password-service";
import { signupFn, updateUserFn } from "./user-handlers";
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

      expect(createdUser).not.toBe(null);
      expect(createdUser!.name).toBe(testData.name);
      expect(createdUser!.email).toBe(testData.email);
      expect(createdUser!.id).toBeDefined();
      expect(createdUser!.createdAt).toBeInstanceOf(Date);
      expect(createdUser!.updatedAt).toBeInstanceOf(Date);

      const userSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, createdUser!.id));

      expect(updateSession).toBeCalledWith({
        id: userSessions[0].id,
      });

      // Verify password was hashed correctly
      const isPasswordValid = await verifyPassword(
        testData.password,
        createdUser!.password,
      );
      expect(isPasswordValid).toBe(true);
    });

    it("should throw error when email already exists", async () => {
      const testEmail = faker.internet.email();

      // Create first user
      await db.insert(users).values({
        email: testEmail,
        name: faker.person.fullName(),
        password: await hashPassword(faker.internet.password()),
      });

      try {
        await signupFn({
          data: {
            name: faker.person.fullName(),
            email: testEmail,
            password: "password123",
            passwordConfirmation: "password123",
          },
        });
        expect.fail("Expected ParamsError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ParamsError);
        const paramsError = error as ParamsError;
        expect(paramsError.meta.email).toEqual([
          "This email is already registered.",
        ]);
      }
    });

    it("should throw validation error when passwords don't match", async () => {
      try {
        await signupFn({
          data: {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            password: "password123",
            passwordConfirmation: "differentpassword",
            redirectUrl: "/dashboard",
          },
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ParamsError);
        const paramsError = error as ParamsError;
        expect(paramsError.meta.passwordConfirmation).toEqual([
          "Passwords must match",
        ]);
      }
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
      // Create multiple sessions for the user
      const initialSessions = await db
        .insert(sessions)
        .values([
          { id: crypto.randomUUID(), userId: testUser.id },
          { id: crypto.randomUUID(), userId: testUser.id },
          { id: crypto.randomUUID(), userId: testUser.id },
        ])
        .returning();

      await updateUserFn({
        data: {
          name: "Updated Name",
          email: "updated@test.com",
          currentPassword: "originalpass123",
          password: "",
          passwordConfirmation: "",
        },
      });

      // Verify user was updated in the database
      const updatedUser = await db.query.users.findFirst({
        where: eq(users.id, testUser.id),
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser!.name).toBe("Updated Name");
      expect(updatedUser!.email).toBe("updated@test.com");

      // Verify password wasn't changed
      const isOriginalPasswordValid = await verifyPassword(
        "originalpass123",
        updatedUser!.password,
      );
      expect(isOriginalPasswordValid).toBe(true);

      // Verify sessions remain in database when password is not changed
      const remainingSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, testUser.id));
      expect(remainingSessions).toHaveLength(3);
      expect(remainingSessions.map((session) => session.id).sort()).toEqual(
        initialSessions.map((session) => session.id).sort(),
      );
    });

    it("should update user profile with new password and invalidate all sessions (except current one)", async () => {
      // Create multiple sessions for the user
      await db.insert(sessions).values([
        { id: crypto.randomUUID(), userId: testUser.id },
        { id: crypto.randomUUID(), userId: testUser.id },
        { id: crypto.randomUUID(), userId: testUser.id },
      ]);

      const newEmail = faker.internet.email();

      await updateUserFn({
        data: {
          name: "Updated Name",
          email: newEmail,
          currentPassword: "originalpass123",
          password: "newpassword123",
          passwordConfirmation: "newpassword123",
        },
      });

      // Verify user was updated in the database
      const updatedUser = await db.query.users.findFirst({
        where: eq(users.id, testUser.id),
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser!.name).toBe("Updated Name");
      expect(updatedUser!.email).toBe(newEmail);

      // Verify new password works
      const isNewPasswordValid = await verifyPassword(
        "newpassword123",
        updatedUser!.password,
      );
      expect(isNewPasswordValid).toBe(true);

      // Verify old password no longer works
      const isOldPasswordValid = await verifyPassword(
        "originalpass123",
        updatedUser!.password,
      );
      expect(isOldPasswordValid).toBe(false);

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

    it("should throw error with wrong current password", async () => {
      try {
        await updateUserFn({
          data: {
            name: "Updated Name",
            email: "updated@test.com",
            currentPassword: "wrongpassword",
            password: "",
            passwordConfirmation: "",
          },
        });
        expect.fail("Expected ParamsError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ParamsError);
        const paramsError = error as ParamsError;
        expect(paramsError.meta.currentPassword).toEqual([
          "The current password is wrong",
        ]);
      }
    });

    it("should throw validation error when new passwords don't match", async () => {
      try {
        await updateUserFn({
          data: {
            name: "Updated Name",
            email: "updated@test.com",
            currentPassword: "originalpass123",
            password: "newpassword123",
            passwordConfirmation: "differentpassword",
          },
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ParamsError);
        const paramsError = error as ParamsError;
        expect(paramsError.meta.passwordConfirmation).toEqual([
          "Passwords must match",
        ]);
      }
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
