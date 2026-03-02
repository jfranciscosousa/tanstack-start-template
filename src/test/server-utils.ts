/* oxlint-disable @typescript-eslint/no-unsafe-argument */
/* oxlint-disable @typescript-eslint/no-explicit-any */
import { vi } from "vitest";
import { faker } from "@faker-js/faker";

import { useLoggedInAppSession, useWebSession } from "~/server/web-session";
import { type User, type UserWithoutPassword, users } from "~/server/db/schema";
import { db } from "~/server/db";
import { AppError } from "~/errors";
import { hashPassword } from "~/server/services/password-service";

export async function createTestUser(): Promise<UserWithoutPassword> {
  const [created] = await db
    .insert(users)
    .values({
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: await hashPassword(faker.internet.password()),
    })
    .returning();

  const { password: _password, ...userWithoutPassword } = created;

  return userWithoutPassword;
}


export function mockLoggedIn(user: User) {
  const mock = {
    clear: vi.fn(),
    sessionId: "test-session-id",
    update: vi.fn(),
    user,
  };

  vi.mocked(useWebSession).mockResolvedValue(mock as any);
  vi.mocked(useLoggedInAppSession).mockResolvedValue(mock as any);

  return mock;
}

export function mockLoggedOut() {
  const mock = {
    clear: vi.fn(),
    sessionId: "test-session-id",
    update: vi.fn(),
    user: null,
  };

  vi.mocked(useWebSession).mockResolvedValue(mock as any);
  vi.mocked(useLoggedInAppSession).mockResolvedValue(mock as any);
  vi.mocked(useLoggedInAppSession).mockRejectedValue(new AppError("NOT_FOUND"));

  return mock;
}
