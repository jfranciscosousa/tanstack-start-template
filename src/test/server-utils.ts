import { faker } from "@faker-js/faker";

import type { auth } from "~/lib/auth";

import { users as userTable } from "~/server/db/schema";
import { db } from "~/server/db";

export type TestUser = typeof userTable.$inferSelect;

export async function createTestUser(): Promise<TestUser> {
  const [created] = await db
    .insert(userTable)
    .values({
      id: crypto.randomUUID(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return created;
}

export function makeSessionMock(
  testUser: TestUser,
  sessionToken = "test-session-token"
): typeof auth.$Infer.Session {
  return {
    user: testUser,
    session: {
      id: "test-session-id",
      token: sessionToken,
      userId: testUser.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: null,
      userAgent: null,
    },
  };
}

export function makeSessionsMock(
  testUser: TestUser,
  tokens: string[]
): (typeof auth.$Infer.Session)["session"][] {
  return tokens.map(token => ({
    id: `session-${token}`,
    token,
    userId: testUser.id,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: null,
    userAgent: null,
  }));
}
