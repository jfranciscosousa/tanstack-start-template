import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TestUser } from "~/test/server-utils";
import type { AppError } from "~/errors";

import {
  createTestUser,
  makeSessionMock,
  makeSessionsMock,
} from "~/test/server-utils";
import { auth } from "~/lib/auth";

import { fetchUserSessions, revokeSession } from "./session-handlers";

vi.mock("@tanstack/react-start/server", () => ({
  getRequest: () => new Request("http://localhost:3000/"),
}));

vi.mock("~/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn<() => Promise<unknown>>(),
      listSessions: vi.fn<() => Promise<unknown>>(),
      revokeSession: vi.fn<() => Promise<unknown>>(),
    },
  },
}));

describe("session handlers", () => {
  let testUser: TestUser;

  beforeEach(async () => {
    testUser = await createTestUser();
    vi.clearAllMocks();
  });

  describe("fetchUserSessions", () => {
    it("should call getSession and listSessions when logged in", async () => {
      const mockSessions = makeSessionsMock(testUser, [
        "other-tok1",
        "other-tok2",
      ]);
      const mockSession = makeSessionMock(testUser, "current-token");

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.listSessions).mockResolvedValue(mockSessions);

      await fetchUserSessions();

      expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith(
        expect.objectContaining({ headers: expect.any(Headers) })
      );
      expect(vi.mocked(auth.api.listSessions)).toHaveBeenCalledWith(
        expect.objectContaining({ headers: expect.any(Headers) })
      );
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
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.revokeSession).mockResolvedValue({ status: true });

      await revokeSession({ data: "other-token" });

      expect(vi.mocked(auth.api.revokeSession)).toHaveBeenCalledWith(
        expect.objectContaining({ body: { token: "other-token" } })
      );
    });

    it("should throw BAD_REQUEST when trying to revoke the current session token", async () => {
      const mockSession = makeSessionMock(testUser, "current-token");
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

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
