import { zfd } from "zod-form-data";
import z from "zod";
import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";

import { useLoggedInAppSession } from "~/server/websession";

import { createAndUseSession } from "./sessionHandlers";
import { createUser, updateUser } from "../services/userServices";

export const signUpSchema = zfd
  .formData({
    email: zfd.text(z.email()),
    name: zfd.text(),
    password: zfd.text(),
    passwordConfirmation: zfd.text(),
    redirectUrl: zfd.text(z.string().optional()),
  })
  .refine(data => data.password === data.passwordConfirmation, {
    message: "Passwords must match",
    path: ["passwordConfirmation"],
  });

export type SignUpSchemaType = z.infer<typeof signUpSchema>;

export const signupFn = createServerFn({ method: "POST" })
  .inputValidator(data => data)
  .handler(async ctx => {
    const data = signUpSchema.parse(ctx.data);
    const user = await createUser(data);

    await createAndUseSession(user);

    throw redirect({
      href: data.redirectUrl || "/",
    });
  });

export const updateUserSchema = zfd
  .formData({
    currentPassword: zfd.text(),
    email: zfd.text(z.email()),
    name: zfd.text(),
    password: zfd.text(z.string().optional()),
    passwordConfirmation: zfd.text(z.string().optional()),
  })
  .refine(
    data => {
      if (!data.password) {
        return true;
      }

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

    await updateUser(user, data);

    if (data.password) {
      await createAndUseSession(user);
    }
  });
