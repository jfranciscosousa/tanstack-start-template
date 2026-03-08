import { beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { faker } from "@faker-js/faker";

import type { User, UserWithoutPassword } from "~/server/db/schema";
import { ParamsError } from "~/errors";

import {
  createUser,
  getUserByEmail,
  getUserBySessionId,
  updateUser,
  updateUserTheme,
} from "./user-services";
import { hashPassword, verifyPassword } from "./password-service";
import { sessions, users } from "../db/schema";
import { db } from "../db";

describe("User services", () => {
  describe("createUser", () => {
    it("should create a user with hashed password", async () => {
      const data = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.internet.password(),
        passwordConfirmation: "",
      };
      data.passwordConfirmation = data.password;

      const user: UserWithoutPassword = await createUser(data);

      expect(user).toBeDefined();
      expect(user.email).toBe(data.email);
      expect(user.name).toBe(data.name);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect((user as User).password).toBeUndefined();

      const fromDb = await db.query.users.findFirst({
        where: eq(users.id, user.id),
      });
      if (!fromDb) throw new Error("fromDb should exist");

      const isPasswordValid = await verifyPassword(
        data.password,
        fromDb.password,
      );
      expect(isPasswordValid).toBeTruthy();
    });

    it("should persist the user in the database", async () => {
      const data = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: "testpass123",
        passwordConfirmation: "testpass123",
      };

      const user = await createUser(data);

      const fromDb = await db.query.users.findFirst({
        where: eq(users.id, user.id),
      });

      if (!fromDb) throw new Error("fromDb should exist");
      expect(fromDb.email).toBe(data.email);
      expect(fromDb.name).toBe(data.name);
    });

    it("should throw ParamsError when email already exists", async () => {
      const email = faker.internet.email();

      await db.insert(users).values({
        email,
        name: faker.person.fullName(),
        password: await hashPassword("somepass"),
      });

      try {
        await createUser({
          email,
          name: faker.person.fullName(),
          password: "password123",
          passwordConfirmation: "password123",
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

    it("should throw ParamsError when passwords don't match", async () => {
      try {
        await createUser({
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: "password123",
          passwordConfirmation: "differentpassword",
        });
        expect.fail("Expected ParamsError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ParamsError);
        const paramsError = error as ParamsError;
        expect(paramsError.meta.passwordConfirmation).toEqual([
          "Passwords must match",
        ]);
      }
    });
  });

  describe("getUserByEmail", () => {
    it("should return the user for a matching email", async () => {
      const email = faker.internet.email();
      const [created] = await db
        .insert(users)
        .values({
          email,
          name: faker.person.fullName(),
          password: await hashPassword("pass"),
        })
        .returning();

      const found = await getUserByEmail(email);

      if (!found) throw new Error("found should exist");
      expect(found.id).toBe(created.id);
      expect(found.email).toBe(email);
    });

    it("should return undefined for an unknown email", async () => {
      const result = await getUserByEmail("nonexistent@example.com");

      expect(result).toBeUndefined();
    });

    it("should return undefined when no email is provided", async () => {
      const result = await getUserByEmail(undefined);

      expect(result).toBeUndefined();
    });
  });

  describe("getUserBySessionId", () => {
    it("should return the user for a valid, non-expired session", async () => {
      const [user] = await db
        .insert(users)
        .values({
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: await hashPassword("pass"),
        })
        .returning();

      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const [session] = await db
        .insert(sessions)
        .values({ userId: user.id, expiresAt })
        .returning();

      const result = await getUserBySessionId(session.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);
      expect(result?.email).toBe(user.email);
    });

    it("should return undefined when sessionId is not provided", async () => {
      const result = await getUserBySessionId(undefined);

      expect(result).toBeUndefined();
    });

    it("should return undefined for an unknown session id", async () => {
      const result = await getUserBySessionId(crypto.randomUUID());

      expect(result).toBeUndefined();
    });

    it("should return undefined for an expired session", async () => {
      const [user] = await db
        .insert(users)
        .values({
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: await hashPassword("pass"),
        })
        .returning();

      // 1 second in the past
      const expiresAt = new Date(Date.now() - 1000);
      const [session] = await db
        .insert(sessions)
        .values({ userId: user.id, expiresAt })
        .returning();

      const result = await getUserBySessionId(session.id);

      expect(result).toBeUndefined();
    });

    it("should delete the session from the DB when it is expired", async () => {
      const [user] = await db
        .insert(users)
        .values({
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: await hashPassword("pass"),
        })
        .returning();

      // 1 second in the past
      const expiresAt = new Date(Date.now() - 1000);
      const [session] = await db
        .insert(sessions)
        .values({ userId: user.id, expiresAt })
        .returning();

      await getUserBySessionId(session.id);

      const fromDb = await db.query.sessions.findFirst({
        where: eq(sessions.id, session.id),
      });

      expect(fromDb).toBeUndefined();
    });
  });

  describe("updateUser", () => {
    let testUser: User;

    beforeEach(async () => {
      const [created] = await db
        .insert(users)
        .values({
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: await hashPassword("originalpass123"),
        })
        .returning();

      testUser = created;
    });

    it("should update name and email without changing password", async () => {
      const newEmail = faker.internet.email();

      await updateUser(testUser, {
        name: "Updated Name",
        email: newEmail,
        currentPassword: "originalpass123",
        password: "",
        passwordConfirmation: "",
      });

      const updated = await db.query.users.findFirst({
        where: eq(users.id, testUser.id),
      });
      if (!updated) throw new Error("updated should exist");

      expect(updated.name).toBe("Updated Name");
      expect(updated.email).toBe(newEmail);

      const isOriginalPasswordValid = await verifyPassword(
        "originalpass123",
        updated.password,
      );
      expect(isOriginalPasswordValid).toBeTruthy();
    });

    it("should not delete sessions when password is not changed", async () => {
      const futureExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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
      ]);

      await updateUser(testUser, {
        name: testUser.name,
        email: testUser.email,
        currentPassword: "originalpass123",
        password: "",
        passwordConfirmation: "",
      });

      const remainingSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, testUser.id));

      expect(remainingSessions).toHaveLength(2);
    });

    it("should update password and delete all sessions", async () => {
      const futureExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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

      await updateUser(testUser, {
        name: testUser.name,
        email: testUser.email,
        currentPassword: "originalpass123",
        password: "newpassword123",
        passwordConfirmation: "newpassword123",
      });

      const updated = await db.query.users.findFirst({
        where: eq(users.id, testUser.id),
      });
      if (!updated) throw new Error("updated should exist");

      const isNewPasswordValid = await verifyPassword(
        "newpassword123",
        updated.password,
      );
      expect(isNewPasswordValid).toBeTruthy();

      const isOldPasswordValid = await verifyPassword(
        "originalpass123",
        updated.password,
      );
      expect(isOldPasswordValid).toBeFalsy();

      const remainingSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, testUser.id));

      expect(remainingSessions).toHaveLength(0);
    });

    it("should throw ParamsError with wrong current password", async () => {
      try {
        await updateUser(testUser, {
          name: testUser.name,
          email: testUser.email,
          currentPassword: "wrongpassword",
          password: "",
          passwordConfirmation: "",
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

    it("should throw ParamsError when new passwords don't match", async () => {
      try {
        await updateUser(testUser, {
          name: testUser.name,
          email: testUser.email,
          currentPassword: "originalpass123",
          password: "newpassword123",
          passwordConfirmation: "differentpassword",
        });
        expect.fail("Expected ParamsError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ParamsError);
        const paramsError = error as ParamsError;
        expect(paramsError.meta.passwordConfirmation).toEqual([
          "Passwords must match",
        ]);
      }
    });
  });

  describe("updateUserTheme", () => {
    it("should update the user theme", async () => {
      const [user] = await db
        .insert(users)
        .values({
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: await hashPassword("pass"),
          theme: "light",
        })
        .returning();

      await updateUserTheme(user.id, "dark");

      const updated = await db.query.users.findFirst({
        where: eq(users.id, user.id),
      });

      if (!updated) throw new Error("updated should exist");
      expect(updated.theme).toBe("dark");
    });
  });
});
