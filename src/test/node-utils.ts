/* oxlint-disable @typescript-eslint/no-unsafe-argument */
/* oxlint-disable @typescript-eslint/no-explicit-any */
import { vi } from "vitest";

import { useLoggedInAppSession, useWebSession } from "~/server/websession";
import type { User } from "~/server/db/schema";
import { AppError } from "~/errors";

/**
 * Mock authentication utilities for Node.js tests
 * These utilities help mock the useLoggedInAppSession function for testing server functions
 */

/**
 * Mock a logged-in user state
 * @param user - The user object to return from useLoggedInAppSession
 */
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
