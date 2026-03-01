import { useSession } from "@tanstack/react-start/server";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";

import { AppError } from "~/errors";

import { getUserBySessionId } from "./services/user-services";
import { type Session } from "./db/schema";

type SessionUser = {
  id: Session["id"];
};

export const useWebSession = createServerOnlyFn(async () => {
  if (!process.env.SECRET_KEY_BASE) {
    throw new Error("SECRET_KEY_BASE is not set");
  }

  const sessionProps = await useSession<SessionUser>({
    password: process.env.SECRET_KEY_BASE,
  });

  return {
    ...sessionProps,
    user: await getUserBySessionId(sessionProps.data.id),
  };
});

export const useLoggedInAppSession = createServerOnlyFn(async () => {
  const session = await useWebSession();
  const { user } = session;

  if (!user) {
    throw new AppError("NOT_FOUND");
  }

  return { ...session, user };
});

export const fetchCurrentUser = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useWebSession();

    return session.user;
  }
);
