import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { AppError } from "~/errors";
import { auth } from "~/lib/auth";
import { updateUserTheme } from "~/server/services/user-services";
import { updateUserSchema, updateThemeSchema } from "~/schemas/user-schemas";

export { updateUserSchema };

export const updateUserFn = createServerFn({ method: "POST" })
  .inputValidator(updateUserSchema)
  .handler(async ({ data }) => {
    const req = getRequest();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      throw new AppError("NOT_FOUND");
    }

    await auth.api.updateUser({
      headers: req.headers,
      body: { name: data.name },
    });

    if (data.password) {
      await auth.api.changePassword({
        headers: req.headers,
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.password,
          revokeOtherSessions: true,
        },
      });
    }
  });

export const updateThemeFn = createServerFn({ method: "POST" })
  .inputValidator(updateThemeSchema)
  .handler(async ({ data }) => {
    const req = getRequest();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      throw new AppError("NOT_FOUND");
    }

    await updateUserTheme(session.user.id, data.theme);
  });
