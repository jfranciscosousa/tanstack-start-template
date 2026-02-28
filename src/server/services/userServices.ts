import { eq } from "drizzle-orm";
import { createServerOnlyFn } from "@tanstack/react-start";

import { AppError } from "~/errors";

import { deleteAllSessions } from "./sessionService";
import { hashPassword, verifyPassword } from "./passwordService";
import { type User, users } from "../db/schema";
import { db } from "../db";

export const getUserBySessionId = createServerOnlyFn(
  async (sessionId?: string) => {
    if (!sessionId) {
      return;
    }

    const session = await db.query.sessions.findFirst({
      where: sessionsQuery => eq(sessionsQuery.id, sessionId),
      with: { user: true },
    });

    return session?.user;
  }
);

export const getUserByEmail = createServerOnlyFn((email?: string) => {
  if (!email) {
    return;
  }

  return db.query.users.findFirst({
    where: usersQuery => eq(usersQuery.email, email),
  });
});

export const createUser = createServerOnlyFn(
  async (data: { name: string; email: string; password: string }) => {
    const [found] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    const password = await hashPassword(data.password);

    if (found) {
      throw new AppError(
        "UNPROCESSABLE_ENTITY",
        "This email is already registered."
      );
    }

    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email,
        name: data.name,
        password,
      })
      .returning();

    return newUser;
  }
);

export const updateUser = createServerOnlyFn(
  async (
    user: Omit<User, "password">,
    data: Partial<User> & { currentPassword: string }
  ) => {
    const userPassword = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    if (!(await verifyPassword(data.currentPassword, userPassword!.password))) {
      throw new AppError(
        "UNPROCESSABLE_ENTITY",
        "Your current password is wrong!"
      );
    }

    const updateData: Partial<User> = {
      email: data.email,
      name: data.name,
    };

    // Only update password if a new one is provided
    if (data.password) {
      updateData.password = await hashPassword(data.password);
      await deleteAllSessions(user);
    }

    await db.update(users).set(updateData).where(eq(users.id, user.id));
  }
);
