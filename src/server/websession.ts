import { useSession } from "@tanstack/react-start/server";
import { prismaClient } from "./prisma";
import { User } from "@prisma/client";
import { AppError } from "~/errors";

async function getUserByUserId(userId?: string) {
  if (!userId) return null;

  return prismaClient.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      email: true,
      name: true,
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

type SessionUser = {
  id: User["id"];
};

export async function useAppSession() {
  if (!process.env.SECRET_KEY_BASE)
    throw new Error("SECRET_KEY_BASE is not set");

  const sessionProps = await useSession<SessionUser>({
    password: process.env.SECRET_KEY_BASE,
  });

  return {
    ...sessionProps,
    user: await getUserByUserId(sessionProps.data.id),
  };
}

export async function useLoggedInAppSession() {
  const session = await useAppSession();
  const user = session.user;

  if (!user) throw new AppError("NOT_FOUND");

  return { ...session, user };
}
