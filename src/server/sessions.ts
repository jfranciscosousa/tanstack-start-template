import { createServerFn } from "@tanstack/react-start";
import { verifyPassword } from "./passwords";
import { prismaClient } from "./prisma";
import { useAppSession } from "./websession";
import { zfd } from "zod-form-data";
import z from "zod";
import { AppError } from "~/errors";

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
      throw new AppError("NOT_FOUND", "The combination of email and password is incorrect.");
    }

    const session = await useAppSession();

    await session.update({
      id: user.id,
    });
  });
