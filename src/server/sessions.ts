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

export const invalidateAllSessions = createServerOnlyFn((userId: string) =>
  prismaClient.session.deleteMany({ where: { userId } })
);
