import { createServerFn } from "@tanstack/react-start";
import { verifyPassword } from "./passwords";
import { prismaClient } from "./prisma";
import { useAppSession } from "./websession";
import { zfd } from "zod-form-data";
import z from "zod";

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
      throw new Error("not_found");
    }

    const session = await useAppSession();

    await session.update({
      id: user.id,
    });
  });
