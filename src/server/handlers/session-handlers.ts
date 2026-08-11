import z from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { createServerFn } from "@tanstack/react-start";

import { auth } from "~/lib/auth";
import { AppError } from "~/errors";

export interface SessionView {
  id: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

export function toSessionViews(
  sessions: (Omit<SessionView, "isCurrent"> & { token: string })[],
  currentSessionToken: string
): SessionView[] {
  return sessions.map(session => ({
    id: session.id,
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    expiresAt: session.expiresAt,
    isCurrent: session.token === currentSessionToken,
  }));
}

export const fetchUserSessions = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionView[]> => {
    const req = getRequest();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      throw new AppError(
        "UNAUTHORIZED",
        "You must be logged in to view sessions"
      );
    }

    const sessions = await auth.api.listSessions({ headers: req.headers });

    return toSessionViews(sessions, session.session.token);
  }
);

export const revokeSession = createServerFn({ method: "POST" })
  .validator((sessionId: unknown) => z.string().min(1).parse(sessionId))
  .handler(async ({ data: sessionId }) => {
    const req = getRequest();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      throw new AppError("UNAUTHORIZED", "You must be logged in");
    }

    const sessions = await auth.api.listSessions({ headers: req.headers });
    const targetSession = sessions.find(item => item.id === sessionId);

    if (!targetSession) {
      throw new AppError("NOT_FOUND", "Session not found");
    }

    if (targetSession.token === session.session.token) {
      throw new AppError("BAD_REQUEST", "Cannot revoke your current session");
    }

    await auth.api.revokeSession({
      headers: req.headers,
      body: { token: targetSession.token },
    });
  });
