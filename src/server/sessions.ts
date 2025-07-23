import { createServerFn } from "@tanstack/react-start";
import { verifyPassword } from "./passwords";
import { prismaClient } from "./prisma";
import { useWebSession } from "./websession";
import { zfd } from "zod-form-data";
import z from "zod";
import { AppError } from "~/errors";
import { getWebRequest } from "@tanstack/react-start/server"
import { getRequestInfo } from "./request-info";

const loginSchema = zfd.formData({
  email: zfd.text(z.email()),
  password: zfd.text(),
  redirectUrl: zfd.text().optional(),
});

export const loginFn = createServerFn({ method: "POST" })
  .validator((formData: FormData) => loginSchema.parse(formData))
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
export async function createAndUseSession(userId: string) {
  const request = getWebRequest();
  const { ipAddress, location, userAgent } = await getRequestInfo(request);

  const session = await prismaClient.session.create({
    data: { ipAddress, location, userAgent, userId },
  });
  const webSession = await useWebSession();

  await webSession.update({
    id: session.id,
  });
}

export async function invalidateAllSessions(userId: string) {
  await prismaClient.session.deleteMany({ where: { userId } });
}
