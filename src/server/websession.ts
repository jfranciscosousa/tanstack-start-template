import { useSession } from "@tanstack/react-start/server";
import { prismaClient } from "./prisma";
import { User } from "@prisma/client";

async function getUserByUserId(userId?: string) {
  if (!userId) return null;

  return prismaClient.user.findUnique({
    where: {
      id: userId,
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
