import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TestUser } from "~/test/server-utils";
import type { AppError } from "~/errors";

import {
  createTestUser,
  makeSessionMock,
  makeSessionsMock,
} from "~/test/server-utils";
import { auth } from "~/lib/auth";

import {
  fetchUserSessions,
  revokeSession,
  toSessionViews,
} from "./session-handlers";

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
    it("returns session metadata without bearer tokens", async () => {
      const mockSessions = makeSessionsMock(testUser, [
        "current-token",
        "other-token",
      ]);
      const mockSession = makeSessionMock(testUser, "current-token");

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.listSessions).mockResolvedValue(mockSessions);

      await fetchUserSessions();
      const result = toSessionViews(mockSessions, mockSession.session.token);

      expect(result).toStrictEqual([
        expect.objectContaining({
          id: mockSessions[0]?.id,
          isCurrent: true,
        }),
        expect.objectContaining({
          id: mockSessions[1]?.id,
          isCurrent: false,
        }),
      ]);
      expect(result.filter(item => "token" in item)).toHaveLength(0);
    });

    it("throws UNAUTHORIZED when not logged in", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      await expect(fetchUserSessions()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      } satisfies Partial<AppError>);
    });
  });

  describe("revokeSession", () => {
    it("resolves an owned session id to its token server-side", async () => {
      const mockSession = makeSessionMock(testUser, "current-token");
      const [targetSession] = makeSessionsMock(testUser, ["other-token"]);
      if (!targetSession) throw new Error("Expected a target session");
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.listSessions).mockResolvedValue([targetSession]);
      vi.mocked(auth.api.revokeSession).mockResolvedValue({ status: true });

      await revokeSession({ data: targetSession.id });

      expect(vi.mocked(auth.api.revokeSession)).toHaveBeenCalledWith(
        expect.objectContaining({ body: { token: "other-token" } })
      );
    });

    it("rejects the current session id", async () => {
      const mockSession = makeSessionMock(testUser, "current-token");
      const [currentSession] = makeSessionsMock(testUser, ["current-token"]);
      if (!currentSession) throw new Error("Expected the current session");
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.listSessions).mockResolvedValue([currentSession]);

      await expect(
        revokeSession({ data: currentSession.id })
      ).rejects.toMatchObject({
        code: "BAD_REQUEST",
        message: "Cannot revoke your current session",
      } satisfies Partial<AppError>);
    });

    it("rejects a session id that does not belong to the user", async () => {
      const mockSession = makeSessionMock(testUser, "current-token");
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.listSessions).mockResolvedValue([]);

      await expect(
        revokeSession({ data: "unknown-session" })
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      } satisfies Partial<AppError>);
      expect(auth.api.revokeSession).not.toHaveBeenCalled();
    });

    it("throws UNAUTHORIZED when not logged in", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      await expect(
        revokeSession({ data: "some-session" })
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      } satisfies Partial<AppError>);
    });
  });
});
