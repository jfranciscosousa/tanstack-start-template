import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { zfd } from "zod-form-data";
import { AppError } from "~/errors";
import { hashPassword, verifyPassword } from "~/server/passwords";
import { prismaClient } from "~/server/prisma";
import { useLoggedInAppSession } from "~/server/websession";
import { createAndUseSession, invalidateAllSessions } from "./sessions";

const signUpSchema = zfd
  .formData({
    name: zfd.text(),
    email: zfd.text(z.email()),
    password: zfd.text(),
    passwordConfirmation: zfd.text(),
    redirectUrl: zfd.text().optional(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords must match",
    path: ["passwordConfirmation"],
  });

export const signupFn = createServerFn({ method: "POST" })
  .validator((formData: FormData) => signUpSchema.parse(formData))
  .handler(async ({ data }) => {
    const found = await prismaClient.user.findUnique({
      where: {
        email: data.email,
      },
    });

    const password = await hashPassword(data.password);

    if (found) {
      throw new AppError(
        "UNPROCESSABLE_ENTITY",
        "This email is already registered."
      );
    }

    const user = await prismaClient.user.create({
      data: {
        name: data.name,
        email: data.email,
        password,
      },
    });

    await createAndUseSession(user.id);

    throw redirect({
      href: data.redirectUrl || "/",
    });
  });

const updateUserSchema = zfd
  .formData({
    name: zfd.text(),
    email: zfd.text(z.email()),
    currentPassword: zfd.text(),
    password: zfd.text(z.string().optional()),
    passwordConfirmation: zfd.text(z.string().optional()),
  })
  .refine(
    (data) => {
      if (!data.password) return true;

      return data.password === data.passwordConfirmation;
    },
    {
      message: "Passwords must match",
      path: ["passwordConfirmation"],
    }
  );

export const updateUserFn = createServerFn({ method: "POST" })
  .validator((formData: FormData) => updateUserSchema.parse(formData))
  .handler(async ({ data }) => {
    const { user } = await useLoggedInAppSession();

    const userPassword = await prismaClient.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!(await verifyPassword(data.currentPassword, userPassword!.password))) {
      throw new AppError(
        "UNPROCESSABLE_ENTITY",
        "Your current password is wrong!"
      );
    }

    const updateData: any = {
      name: data.name,
      email: data.email,
    };

    // Only update password if a new one is provided
    if (data.password) {
      updateData.password = await hashPassword(data.password);
      await invalidateAllSessions(user.id);
    }

    await prismaClient.user.update({
      where: { id: user.id },
      data: updateData,
    });

    await createAndUseSession(user.id);
  });
