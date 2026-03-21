import { getRequest } from "@tanstack/react-start/server";
import { createServerOnlyFn } from "@tanstack/react-start";

import { auth } from "~/lib/auth";
import { AppError } from "~/errors";

export const useLoggedInAppSession = createServerOnlyFn(async () => {
  const req = getRequest();
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    throw new AppError("UNAUTHORIZED");
  }

  return session;
});
