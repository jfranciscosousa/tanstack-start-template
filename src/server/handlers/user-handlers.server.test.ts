import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "~/errors";
import { auth } from "~/lib/auth";
import { createTestUser, makeSessionMock } from "~/test/server-utils";
import type { TestUser } from "~/test/server-utils";

import { updateUserFn, updateThemeFn } from "./user-handlers";

vi.mock("@tanstack/react-start/server", () => ({
  getRequest: () => new Request("http://localhost:3000/"),
}));

vi.mock("~/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      updateUser: vi.fn(),
      changePassword: vi.fn(),
    },
  },
}));

vi.mock("~/server/services/user-services", () => ({
  updateUserTheme: vi.fn(),
}));

describe("User handlers", () => {
  let testUser: TestUser;

  beforeEach(async () => {
    testUser = await createTestUser();
    vi.clearAllMocks();
  });

  describe("updateUserFn", () => {
    it("should call updateUser and skip changePassword when no new password", async () => {
      const mockSession = makeSessionMock(testUser);
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
      vi.mocked(auth.api.updateUser).mockResolvedValue({} as any);

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
          body: { name: "New Name", email: "new@example.com" },
        }),
      );
      expect(vi.mocked(auth.api.changePassword)).not.toHaveBeenCalled();
    });

    it("should call changePassword with revokeOtherSessions when password is provided", async () => {
      const mockSession = makeSessionMock(testUser);
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
      vi.mocked(auth.api.updateUser).mockResolvedValue({} as any);
      vi.mocked(auth.api.changePassword).mockResolvedValue({} as any);

      await updateUserFn({
        data: {
          name: "Name",
          currentPassword: "oldpass123",
          password: "newpass123",
          passwordConfirmation: "newpass123",
        },
      });

      expect(vi.mocked(auth.api.changePassword)).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            currentPassword: "oldpass123",
            newPassword: "newpass123",
            revokeOtherSessions: true,
          },
        }),
      );
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
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);

      const { updateUserTheme } =
        await import("~/server/services/user-services");

      await updateThemeFn({ data: { theme: "light" } });

      expect(vi.mocked(updateUserTheme)).toHaveBeenCalledWith(
        testUser.id,
        "light",
      );
    });
  });
});
