import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TestUser } from "~/test/server-utils";
import type { AppError } from "~/errors";

import { createTestUser, makeSessionMock } from "~/test/server-utils";
import { auth } from "~/lib/auth";

import { updateUserFn, updateThemeFn } from "./user-handlers";

vi.mock("@tanstack/react-start/server", () => ({
  getRequest: () => new Request("http://localhost:3000/"),
}));

vi.mock("~/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn<() => Promise<unknown>>(),
      updateUser: vi.fn<() => Promise<unknown>>(),
      changePassword: vi.fn<() => Promise<unknown>>(),
      changeEmail: vi.fn<() => Promise<unknown>>(),
    },
  },
}));

vi.mock("~/server/services/user-services", () => ({
  updateUserTheme: vi.fn<() => Promise<unknown>>(),
}));

describe("user handlers", () => {
  let testUser: TestUser;

  beforeEach(async () => {
    testUser = await createTestUser();
    vi.clearAllMocks();
  });

  describe("updateUserFn", () => {
    it("should call updateUser and skip changePassword when no new password", async () => {
      const mockSession = makeSessionMock(testUser);
      vi.mocked(auth.api.getSession).mockResolvedValue(
        mockSession as Awaited<ReturnType<typeof auth.api.getSession>>
      );
      vi.mocked(auth.api.updateUser).mockResolvedValue(
        {} as Awaited<ReturnType<typeof auth.api.updateUser>>
      );

      await updateUserFn({
        data: {
          name: "New Name",
          currentPassword: "",
          password: "",
          passwordConfirmation: "",
        },
      });

      expect(vi.mocked(auth.api.updateUser)).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { name: "New Name" },
        })
      );
      expect(vi.mocked(auth.api.changePassword)).not.toHaveBeenCalled();
    });

    it("should call changePassword with revokeOtherSessions when password is provided", async () => {
      const mockSession = makeSessionMock(testUser);
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.updateUser).mockResolvedValue({ status: true });
      vi.mocked(auth.api.changePassword).mockResolvedValue({
        token: "mock",
        user: testUser,
      });

      await updateUserFn({
        data: {
          name: "Name",
          currentPassword: "oldpass123",
          password: "newpass123",
          passwordConfirmation: "newpass123",
        },
      });

      expect(vi.mocked(auth.api.changePassword)).toHaveBeenCalledWith({
        body: {
          currentPassword: "oldpass123",
          newPassword: "newpass123",
          revokeOtherSessions: true,
        },
        headers: expect.anything(),
      });
    });

    it("should call changeEmail when email is provided", async () => {
      const mockSession = makeSessionMock(testUser);
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.updateUser).mockResolvedValue({ status: true });
      vi.mocked(auth.api.changeEmail).mockResolvedValue({ status: true });

      await updateUserFn({
        data: {
          name: "Name",
          email: "new@example.com",
          currentPassword: "",
          password: "",
          passwordConfirmation: "",
        },
      });

      expect(vi.mocked(auth.api.changeEmail)).toHaveBeenCalledWith({
        headers: expect.anything(),
        body: { newEmail: "new@example.com" },
      });
    });

    it("should not call changeEmail when email is not provided", async () => {
      const mockSession = makeSessionMock(testUser);
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.updateUser).mockResolvedValue({ status: true });

      await updateUserFn({
        data: {
          name: "Name",
          currentPassword: "",
          password: "",
          passwordConfirmation: "",
        },
      });

      expect(vi.mocked(auth.api.changeEmail)).not.toHaveBeenCalled();
    });

    it("should not call changeEmail when email is unchanged", async () => {
      const mockSession = makeSessionMock(testUser);
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.updateUser).mockResolvedValue({ status: true });

      await updateUserFn({
        data: {
          name: "Name",
          email: testUser.email,
          currentPassword: "",
          password: "",
          passwordConfirmation: "",
        },
      });

      expect(vi.mocked(auth.api.changeEmail)).not.toHaveBeenCalled();
    });

    it("should throw NOT_FOUND when not logged in", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      try {
        await updateUserFn({
          data: {
            name: "Name",
            currentPassword: "",
            password: "",
            passwordConfirmation: "",
          },
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as AppError).code).toBe("NOT_FOUND");
      }
    });
  });

  describe("updateThemeFn", () => {
    it("should call updateUserTheme with the new theme", async () => {
      const mockSession = makeSessionMock(testUser);
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const { updateUserTheme } =
        await import("~/server/services/user-services");

      await updateThemeFn({ data: { theme: "light" } });

      expect(vi.mocked(updateUserTheme)).toHaveBeenCalledWith(
        testUser.id,
        "light"
      );
    });
  });
});
