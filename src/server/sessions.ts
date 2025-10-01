import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { verifyPassword } from "./passwords";
import { prismaClient } from "./prisma";
import { useWebSession } from "./websession";
import { zfd } from "zod-form-data";
import z from "zod";
import { AppError } from "~/errors";
import { getRequestInfo } from "./request-info";
import { getRequest } from "@tanstack/react-start/server";

const loginSchema = zfd.formData({
  email: zfd.text(z.email()),
  password: zfd.text(),
  redirectUrl: zfd.text().optional(),
});

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((formData: FormData) => loginSchema.parse(formData))
  .handler(async ({ data }) => {
    const user = await prismaClient.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user || !(await verifyPassword(data.password, user.password))) {
      throw new AppError(
        "NOT_FOUND",
        "The combination of email and password is incorrect."
      );
    }

    await createAndUseSession(user.id);
  });

/**
 * Creates a session in the database and updates the web session (cookie)
 */
export const createAndUseSession = createServerOnlyFn(
  async (userId: string) => {
    const request = getRequest();
    const { ipAddress, location, userAgent } = await getRequestInfo(request);

    const session = await prismaClient.session.create({
      data: { ipAddress, location, userAgent, userId },
    });
    const webSession = await useWebSession();

    await webSession.update({
      id: session.id,
    });
  }
);

export const invalidateCurrentSession = createServerOnlyFn(async () => {
  const webSession = await useWebSession();

  await prismaClient.session.delete({ where: { id: webSession.data.id } });
  webSession.clear();
});

export const invalidateAllSessions = createServerOnlyFn((userId: string) =>
  prismaClient.session.deleteMany({ where: { userId } })
);

/**
 * Fetches all sessions for the current user
 */

export const fetchUserSessions = createServerFn({ method: "GET" }).handler(
  async () => {
    const webSession = await useWebSession();

    if (!webSession.user) {
      throw new AppError(
        "UNAUTHORIZED",
        "You must be logged in to view sessions"
      );
    }

    const sessions = await prismaClient.session.findMany({
      where: { userId: webSession.user.id },
      orderBy: { updatedAt: "desc" },
    });

    return {
      sessions,
      currentSessionId: webSession.data.id,
    };
  }
);

/**
 * Revokes a specific session
 */
export const revokeSession = createServerFn({ method: "POST" })
  .inputValidator((sessionId: string) => z.string().uuid().parse(sessionId))
  .handler(async ({ data: sessionId }) => {
    const webSession = await useWebSession();

    if (!webSession.user) {
      throw new AppError("UNAUTHORIZED", "You must be logged in");
    }

    // Verify the session belongs to the user
    const session = await prismaClient.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== webSession.user.id) {
      throw new AppError("NOT_FOUND", "Session not found");
    }

    // Don't allow revoking the current session
    if (sessionId === webSession.data.id) {
      throw new AppError("BAD_REQUEST", "Cannot revoke your current session");
    }

    await prismaClient.session.delete({
      where: { id: sessionId },
    });
  });
