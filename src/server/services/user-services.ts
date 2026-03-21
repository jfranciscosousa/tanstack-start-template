import { eq } from "drizzle-orm";
import { createServerOnlyFn } from "@tanstack/react-start";

import { users } from "../db/schema";
import { db } from "../db";

export const updateUserTheme = createServerOnlyFn(
  async (userId: string, theme: "dark" | "light") => {
    await db.update(users).set({ theme }).where(eq(users.id, userId));
  }
);
