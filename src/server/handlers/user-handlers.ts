import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";

import { useLoggedInAppSession } from "~/server/web-session";
import {
  signUpSchema,
  updateUserSchema,
  updateThemeSchema,
} from "~/schemas/user-schemas";

import { createAndUseSession } from "./session-handlers";
import {
  createUser,
  updateUser,
  updateUserTheme,
} from "../services/user-services";

export { signUpSchema, updateUserSchema };
export type { SignUpSchemaType } from "~/schemas/user-schemas";

export const signupFn = createServerFn({ method: "POST" })
  .inputValidator(signUpSchema)
  .handler(async ({ data }) => {
    const user = await createUser(data);

    await createAndUseSession(user);

    throw redirect({
      href: data.redirectUrl || "/",
    });
  });

export const updateUserFn = createServerFn({ method: "POST" })
  .inputValidator(updateUserSchema)
  .handler(async ({ data }) => {
    const { user } = await useLoggedInAppSession();

    await updateUser(user, data);

    if (data.password) {
      await createAndUseSession(user);
    }
  });

export const updateThemeFn = createServerFn({ method: "POST" })
  .inputValidator(updateThemeSchema)
  .handler(async ({ data }) => {
    const { user } = await useLoggedInAppSession();
    await updateUserTheme(user.id, data.theme);
  });
