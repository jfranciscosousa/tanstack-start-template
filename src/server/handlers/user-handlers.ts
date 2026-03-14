import { getRequest } from "@tanstack/react-start/server";
import { createServerFn } from "@tanstack/react-start";

import { updateUserTheme } from "~/server/services/user-services";
import { updateUserSchema, updateThemeSchema } from "~/schemas/user-schemas";
import { auth } from "~/lib/auth";
import { AppError, ParamsError } from "~/errors";

export { updateUserSchema };

export const updateUserFn = createServerFn({ method: "POST" })
  .inputValidator(updateUserSchema)
  .handler(async ({ data }) => {
    const req = getRequest();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      throw new AppError("NOT_FOUND");
    }

    if (data.currentPassword && !data.password) {
      // Validate current password without changing it (no session revocation).
      // Uses currentPassword as newPassword — a no-op hash update — just to
      // Confirm the credential is correct before allowing any profile changes.
      try {
        await auth.api.changePassword({
          headers: req.headers,
          body: {
            currentPassword: data.currentPassword,
            newPassword: data.currentPassword,
            revokeOtherSessions: false,
          },
        });
      } catch {
        throw new ParamsError({
          currentPassword: ["The current password is wrong"],
        });
      }
    }

    await auth.api.updateUser({
      headers: req.headers,
      body: { name: data.name },
    });

    if (data.currentPassword && data.password) {
      // Change password after name update so session revocation doesn't
      // Invalidate the headers used by updateUser above.
      try {
        await auth.api.changePassword({
          headers: req.headers,
          body: {
            currentPassword: data.currentPassword,
            newPassword: data.password,
            revokeOtherSessions: true,
          },
        });
      } catch {
        throw new ParamsError({
          currentPassword: ["The current password is wrong"],
        });
      }
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
