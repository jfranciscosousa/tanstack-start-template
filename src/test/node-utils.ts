/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from "vitest";
import type { User } from "@prisma/client";
import { useLoggedInAppSession, useWebSession } from "~/server/websession";
import { AppError } from "~/errors";

/**
 * Mock authentication utilities for Node.js tests
 * These utilities help mock the useLoggedInAppSession function for testing server functions
 */

/**
 * Mock a logged-in user state
 * @param user - The user object to return from useLoggedInAppSession
 */
export const mockLoggedIn = (user: User) => {
  const mock = {
    sessionId: "test-session-id",
    user,
    update: vi.fn(),
    clear: vi.fn(),
  };

  vi.mocked(useWebSession).mockResolvedValue(mock as any);
  vi.mocked(useLoggedInAppSession).mockResolvedValue(mock as any);

  return mock;
};

export const mockLoggedOut = () => {
  vi.mocked(useLoggedInAppSession).mockRejectedValue(new AppError("NOT_FOUND"));
};
