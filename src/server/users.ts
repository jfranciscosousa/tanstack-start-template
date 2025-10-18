import { redirect } from "@tanstack/react-router";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import z from "zod";
import { zfd } from "zod-form-data";
import { AppError } from "~/errors";
import { hashPassword, verifyPassword } from "~/server/passwords";
import { db } from "~/server/db";
import { users, type User } from "~/server/db/schema";
import { useLoggedInAppSession } from "~/server/websession";
import { createAndUseSession, invalidateAllSessions } from "./sessions";
import { eq } from "drizzle-orm";

export const signUpSchema = zfd
  .formData({
    name: zfd.text(),
    email: zfd.text(z.email()),
    password: zfd.text(),
    passwordConfirmation: zfd.text(),
    redirectUrl: zfd.text(z.string().optional()),
  })
  .refine(data => data.password === data.passwordConfirmation, {
    message: "Passwords must match",
    path: ["passwordConfirmation"],
  });

export type SignUpSchemaType = z.infer<typeof signUpSchema>;

export const createUser = createServerOnlyFn(async (data: SignUpSchemaType) => {
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
});

export const signupFn = createServerFn({ method: "POST" })
  .inputValidator(data => data)
  .handler(async ctx => {
    const data = signUpSchema.parse(ctx.data);
    const user = await createUser(data);

    await createAndUseSession(user.id);

    throw redirect({
      href: data.redirectUrl || "/",
    });
  });

export const updateUserSchema = zfd
  .formData({
    name: zfd.text(),
    email: zfd.text(z.email()),
    currentPassword: zfd.text(),
    password: zfd.text(z.string().optional()),
    passwordConfirmation: zfd.text(z.string().optional()),
  })
  .refine(
    data => {
      if (!data.password) return true;

      return data.password === data.passwordConfirmation;
    },
    {
      message: "Passwords must match",
      path: ["passwordConfirmation"],
    }
  );

export const updateUserFn = createServerFn({ method: "POST" })
  .inputValidator(data => data)
  .handler(async ctx => {
    const data = updateUserSchema.parse(ctx.data);
    const { user } = await useLoggedInAppSession();

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
      await invalidateAllSessions(user.id);
    }

    await db.update(users).set(updateData).where(eq(users.id, user.id));

    if (data.password) {
      await createAndUseSession(user.id);
    }
  });
