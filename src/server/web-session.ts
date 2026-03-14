import { createServerOnlyFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { AppError } from "~/errors";
import { auth } from "~/lib/auth";

export const useLoggedInAppSession = createServerOnlyFn(async () => {
  const req = getRequest();
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    throw new AppError("UNAUTHORIZED");
  }

  return session;
});
