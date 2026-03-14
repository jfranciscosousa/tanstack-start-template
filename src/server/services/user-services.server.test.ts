import { beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { faker } from "@faker-js/faker";

import { users as userTable } from "~/server/db/schema";
import { db } from "~/server/db";

import { updateUserTheme } from "./user-services";

describe("User services", () => {
  describe("updateUserTheme", () => {
    it("should update the user theme in the database", async () => {
      const [created] = await db
        .insert(userTable)
        .values({
          id: crypto.randomUUID(),
          name: faker.person.fullName(),
          email: faker.internet.email(),
          emailVerified: true,
          theme: "light",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      await updateUserTheme(created.id, "dark");

      const updated = await db.query.users.findFirst({
        where: eq(userTable.id, created.id),
      });

      if (!updated) throw new Error("updated should exist");
      expect(updated.theme).toBe("dark");
    });
  });
});
