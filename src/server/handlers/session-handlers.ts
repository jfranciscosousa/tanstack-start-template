import z from "zod";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { AppError } from "~/errors";
import { auth } from "~/lib/auth";

export const fetchUserSessions = createServerFn({ method: "GET" }).handler(
  async () => {
    const req = getRequest();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      throw new AppError(
        "UNAUTHORIZED",
        "You must be logged in to view sessions"
      );
    }

    const sessions = await auth.api.listSessions({ headers: req.headers });

    return {
      currentSessionToken: session.session.token,
      sessions,
    };
  }
);

export const revokeSession = createServerFn({ method: "POST" })
  .inputValidator((token: unknown) => z.string().parse(token))
  .handler(async ({ data: token }) => {
    const req = getRequest();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      throw new AppError("UNAUTHORIZED", "You must be logged in");
    }

    if (token === session.session.token) {
      throw new AppError("BAD_REQUEST", "Cannot revoke your current session");
    }

    await auth.api.revokeSession({
      headers: req.headers,
      body: { token },
    });
  });
