import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { zfd } from "zod-form-data";
import { hashPassword } from "~/server/passwords";
import { prismaClient } from "~/server/prisma";
import { useAppSession } from "~/server/websession";

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

    const session = await useAppSession();

    if (found) {
      throw new Error("user exists");
    }

    const user = await prismaClient.user.create({
      data: {
        name: data.name,
        email: data.email,
        password,
      },
    });

    await session.update({
      id: user.id,
    });

    throw redirect({
      href: data.redirectUrl || "/",
    });
  });
