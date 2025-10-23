import { createServerOnlyFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { AppError } from "~/errors";
import { db } from "../db";
import { type User, users } from "../db/schema";
import { hashPassword, verifyPassword } from "./passwordService";
import { deleteAllSessions } from "./sessionService";

export const getUserBySessionId = createServerOnlyFn(
  async (sessionId?: string) => {
    if (!sessionId) return;

    const session = await db.query.sessions.findFirst({
      where: session => eq(session.id, sessionId),
      with: { user: true },
    });

    return session?.user;
  }
);

export const getUserByEmail = createServerOnlyFn((email?: string) => {
  if (!email) return;

  return db.query.users.findFirst({
    where: users => eq(users.email, email),
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
        name: data.name,
        email: data.email,
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
      name: data.name,
      email: data.email,
    };

    // Only update password if a new one is provided
    if (data.password) {
      updateData.password = await hashPassword(data.password);
      await deleteAllSessions(user);
    }

    await db.update(users).set(updateData).where(eq(users.id, user.id));
  }
);
