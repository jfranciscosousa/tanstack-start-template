import { faker } from "@faker-js/faker";
import type { User } from "~/server/db/schema";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { ZodError } from "zod";
import { AppError } from "~/errors";
import { mockLoggedIn, mockLoggedOut } from "~/test/node-utils";
import { hashPassword, verifyPassword } from "../services/passwordService";
import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import { signupFn, updateUserFn } from "../handlers/userHandlers";

vi.mock("@tanstack/react-start/server", () => ({
  getRequest: () => new Request("http://localhost:3000/"),
}));
vi.mock("~/server/websession");

describe("User schemas integration tests", () => {
  describe("signupFn", () => {
    it("should create a user with its given params", async () => {
      const { update: updateSession } = mockLoggedOut();
      const testData = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        passwordConfirmation: "", // Will be set to match password
        redirectUrl: "/dashboard",
      };
      testData.passwordConfirmation = testData.password;

      // Create FormData as the function expects
      const formData = new FormData();
      formData.append("name", testData.name);
      formData.append("email", testData.email);
      formData.append("password", testData.password);
      formData.append("passwordConfirmation", testData.passwordConfirmation);
      formData.append("redirectUrl", testData.redirectUrl);

      // Test that the function creates a user (it will throw a redirect, which is expected)
      try {
        await signupFn({ data: formData });
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
        createdUser!.password
      );
      expect(isPasswordValid).toBe(true);
    });

    it("should throw error when email already exists", async () => {
      const testEmail = faker.internet.email();

      // Create first user
      await db.insert(users).values({
        name: faker.person.fullName(),
        email: testEmail,
        password: await hashPassword(faker.internet.password()),
      });

      // Try to create second user with same email
      const duplicateFormData = new FormData();
      duplicateFormData.append("name", faker.person.fullName());
      duplicateFormData.append("email", testEmail);
      duplicateFormData.append("password", "password123");
      duplicateFormData.append("passwordConfirmation", "password123");

      try {
        await signupFn({ data: duplicateFormData });
        expect.fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        const appError = error as AppError;
        expect(appError.code).toBe("UNPROCESSABLE_ENTITY");
        expect(appError.message).toBe("This email is already registered.");
      }
    });

    it("should throw validation error when passwords don't match", async () => {
      const mismatchFormData = new FormData();
      mismatchFormData.append("name", faker.person.fullName());
      mismatchFormData.append("email", faker.internet.email());
      mismatchFormData.append("password", "password123");
      mismatchFormData.append("passwordConfirmation", "differentpassword");
      mismatchFormData.append("redirectUrl", "/dashboard");

      try {
        await signupFn({ data: mismatchFormData });
        expect.fail("Expected validation error to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError).toBeDefined();
        expect(zodError.message).toContain("Passwords must match");
      }
    });
  });

  describe("updateUserFn", () => {
    let testUser: User;
    let updateSession: Mock;

    beforeEach(async () => {
      // Create a test user for update operations

      const [createdUser] = await db
        .insert(users)
        .values({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: await hashPassword("originalpass123"),
        })
        .returning();

      testUser = createdUser;

      // Mock the session to return our test user
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

      const updateFormData = new FormData();
      updateFormData.append("name", "Updated Name");
      updateFormData.append("email", "updated@test.com");
      updateFormData.append("currentPassword", "originalpass123");

      await updateUserFn({ data: updateFormData });

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
        updatedUser!.password
      );
      expect(isOriginalPasswordValid).toBe(true);

      // Verify sessions remain in database when password is not changed
      const remainingSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, testUser.id));
      expect(remainingSessions).toHaveLength(3);
      expect(remainingSessions.map(s => s.id).sort()).toEqual(
        initialSessions.map(s => s.id).sort()
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
      const updateFormData = new FormData();
      updateFormData.append("name", "Updated Name");
      updateFormData.append("email", newEmail);
      updateFormData.append("currentPassword", "originalpass123");
      updateFormData.append("password", "newpassword123");
      updateFormData.append("passwordConfirmation", "newpassword123");

      await updateUserFn({ data: updateFormData });

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
        updatedUser!.password
      );
      expect(isNewPasswordValid).toBe(true);

      // Verify old password no longer works
      const isOldPasswordValid = await verifyPassword(
        "originalpass123",
        updatedUser!.password
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
      const updateFormData = new FormData();
      updateFormData.append("name", "Updated Name");
      updateFormData.append("email", "updated@test.com");
      updateFormData.append("currentPassword", "wrongpassword");

      try {
        await updateUserFn({ data: updateFormData });
        expect.fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        const appError = error as AppError;
        expect(appError.code).toBe("UNPROCESSABLE_ENTITY");
        expect(appError.message).toBe("Your current password is wrong!");
      }
    });

    it("should throw validation error when new passwords don't match", async () => {
      const updateFormData = new FormData();
      updateFormData.append("name", "Updated Name");
      updateFormData.append("email", "updated@test.com");
      updateFormData.append("currentPassword", "originalpass123");
      updateFormData.append("password", "newpassword123");
      updateFormData.append("passwordConfirmation", "differentpassword");

      try {
        await updateUserFn({ data: updateFormData });
        expect.fail("Expected validation error to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.message).toContain("Passwords must match");
      }
    });

    it("should throw error when no user is logged in", async () => {
      mockLoggedOut();
      const updateFormData = new FormData();
      updateFormData.append("name", "Updated Name");
      updateFormData.append("email", "updated@test.com");
      updateFormData.append("currentPassword", "originalpass123");

      try {
        await updateUserFn({ data: updateFormData });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        const appError = error as AppError;

        expect(appError.code).toBe("NOT_FOUND");
        expect(appError.message).toBe("The requested resource was not found.");
      }
    });
  });
});
