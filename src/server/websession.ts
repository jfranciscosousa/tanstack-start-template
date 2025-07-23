import { useSession } from "@tanstack/react-start/server";
import { prismaClient } from "./prisma";
import type { Session } from "@prisma/client";
import { AppError } from "~/errors";

async function getUserBySession(sessionId?: string) {
  if (!sessionId) return;

  const session = await prismaClient.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: {
        omit: { password: true },
      },
    },
  });

  return session?.user;
}

type SessionUser = {
  id: Session["id"];
};

export async function useWebSession() {
  if (!process.env.SECRET_KEY_BASE)
    throw new Error("SECRET_KEY_BASE is not set");

  const sessionProps = await useSession<SessionUser>({
    password: process.env.SECRET_KEY_BASE,
  });

  return {
    ...sessionProps,
    user: await getUserBySession(sessionProps.data.id),
  };
}

export async function useLoggedInAppSession() {
  const session = await useWebSession();
  const user = session.user;

  if (!user) throw new AppError("NOT_FOUND");

  return { ...session, user };
}
