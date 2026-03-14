import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "~/errors";
import { auth } from "~/lib/auth";
import { createTestUser, makeSessionMock } from "~/test/server-utils";
import type { TestUser } from "~/test/server-utils";

import { fetchUserSessions, revokeSession } from "./session-handlers";

vi.mock("@tanstack/react-start/server", () => ({
  getRequest: () => new Request("http://localhost:3000/"),
}));

vi.mock("~/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      listSessions: vi.fn(),
      revokeSession: vi.fn(),
    },
  },
}));

describe("Session handlers", () => {
  let testUser: TestUser;

  beforeEach(async () => {
    testUser = await createTestUser();
    vi.clearAllMocks();
  });

  describe("fetchUserSessions", () => {
    it("should return sessions and current session token when logged in", async () => {
      const mockSessions = [{ id: "s1", token: "tok1" }, { id: "s2", token: "tok2" }];
      const mockSession = makeSessionMock(testUser, "current-token");

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
      vi.mocked(auth.api.listSessions).mockResolvedValue(mockSessions as any);

      const result = await fetchUserSessions();

      expect(result.currentSessionToken).toBe("current-token");
      expect(result.sessions).toEqual(mockSessions);
    });

    it("should throw UNAUTHORIZED when not logged in", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      try {
        await fetchUserSessions();
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as AppError).code).toBe("UNAUTHORIZED");
      }
    });
  });

  describe("revokeSession", () => {
    it("should call auth.api.revokeSession for a different session token", async () => {
      const mockSession = makeSessionMock(testUser, "current-token");
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
      vi.mocked(auth.api.revokeSession).mockResolvedValue(undefined as any);

      await revokeSession({ data: "other-token" });

      expect(vi.mocked(auth.api.revokeSession)).toHaveBeenCalledWith(
        expect.objectContaining({ body: { token: "other-token" } })
      );
    });

    it("should throw BAD_REQUEST when trying to revoke the current session token", async () => {
      const mockSession = makeSessionMock(testUser, "current-token");
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);

      try {
        await revokeSession({ data: "current-token" });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as AppError).code).toBe("BAD_REQUEST");
        expect((error as AppError).message).toBe(
          "Cannot revoke your current session"
        );
      }
    });

    it("should throw UNAUTHORIZED when not logged in", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      try {
        await revokeSession({ data: "some-token" });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as AppError).code).toBe("UNAUTHORIZED");
      }
    });
  });
});
