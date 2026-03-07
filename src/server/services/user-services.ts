import { eq } from "drizzle-orm";
import { createServerOnlyFn } from "@tanstack/react-start";

import { ParamsError } from "~/errors";

import { deleteAllSessions } from "./session-service";
import { hashPassword, verifyPassword } from "./password-service";
import { type User, users } from "../db/schema";
import { db } from "../db";

export const getUserBySessionId = createServerOnlyFn(
  async (sessionId?: string) => {
    if (!sessionId) {
      return;
    }

    const session = await db.query.sessions.findFirst({
      where: (sessionsQuery) => eq(sessionsQuery.id, sessionId),
      with: { user: true },
    });

    return session?.user;
  },
);

export const getUserByEmail = createServerOnlyFn((email?: string) => {
  if (!email) {
    return;
  }

  return db.query.users.findFirst({
    where: (usersQuery) => eq(usersQuery.email, email),
  });
});

export const createUser = createServerOnlyFn(
  async (data: {
    name: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }) => {
    const [found] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    const password = await hashPassword(data.password);

    if (found) {
      throw new ParamsError({ email: ["This email is already registered."] });
    }

    if (data.password !== data.passwordConfirmation) {
      throw new ParamsError({
        passwordConfirmation: ["Passwords must match"],
      });
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
  },
);

export const updateUserTheme = createServerOnlyFn(
  async (userId: string, theme: "dark" | "light") => {
    await db.update(users).set({ theme }).where(eq(users.id, userId));
  },
);

export const updateUser = createServerOnlyFn(
  async (
    user: Omit<User, "password">,
    data: Partial<User> & {
      currentPassword: string;
      passwordConfirmation?: string;
    },
  ) => {
    const userPassword = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: { password: true },
    });

    if (!(await verifyPassword(data.currentPassword, userPassword?.password))) {
      throw new ParamsError({
        currentPassword: ["The current password is wrong"],
      });
    }

    const updateData: Partial<User> = {
      email: data.email,
      name: data.name,
    };

    // Only update password if a new one is provided
    if (data.password) {
      if (data.password !== data.passwordConfirmation) {
        throw new ParamsError({
          passwordConfirmation: ["Passwords must match"],
        });
      }

      updateData.password = await hashPassword(data.password);
      await deleteAllSessions(user);
    }

    await db.update(users).set(updateData).where(eq(users.id, user.id));
  },
);
