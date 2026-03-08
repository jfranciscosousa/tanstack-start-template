import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseSession = vi.fn();

vi.mock("@tanstack/react-start/server", () => ({
  useSession: mockUseSession,
}));

vi.mock("@tanstack/react-start", () => ({
  createServerOnlyFn: (fn: (...args: unknown[]) => unknown) => fn,
  createServerFn: () => ({ handler: (fn: unknown) => fn }),
}));

vi.mock("~/server/services/user-services", () => ({
  getUserBySessionId: vi.fn().mockResolvedValue(null),
}));

describe("useWebSession cookie configuration", () => {
  beforeEach(() => {
    process.env.SECRET_KEY_BASE = "test-secret-key";
    mockUseSession.mockResolvedValue({
      data: { id: "test-session-id" },
      update: vi.fn(),
      clear: vi.fn(),
    });
  });

  it("calls useSession with httpOnly: true", async () => {
    const { useWebSession } = await import("~/server/web-session");
    await useWebSession();
    expect(mockUseSession).toHaveBeenCalledWith(
      expect.objectContaining({
        cookie: expect.objectContaining({ httpOnly: true }),
      })
    );
  });

  it("calls useSession with sameSite: lax", async () => {
    const { useWebSession } = await import("~/server/web-session");
    await useWebSession();
    expect(mockUseSession).toHaveBeenCalledWith(
      expect.objectContaining({
        cookie: expect.objectContaining({ sameSite: "lax" }),
      })
    );
  });

  it("sets secure: false outside of production", async () => {
    const { useWebSession } = await import("~/server/web-session");
    await useWebSession();
    expect(mockUseSession).toHaveBeenCalledWith(
      expect.objectContaining({
        cookie: expect.objectContaining({ secure: false }),
      })
    );
  });

  it("sets secure: true in production", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    try {
      const { useWebSession } = await import("~/server/web-session");
      await useWebSession();
      expect(mockUseSession).toHaveBeenCalledWith(
        expect.objectContaining({
          cookie: expect.objectContaining({ secure: true }),
        })
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it("passes SECRET_KEY_BASE as the password", async () => {
    const { useWebSession } = await import("~/server/web-session");
    await useWebSession();
    expect(mockUseSession).toHaveBeenCalledWith(
      expect.objectContaining({ password: "test-secret-key" })
    );
  });

  it("throws when SECRET_KEY_BASE is not set", async () => {
    delete process.env.SECRET_KEY_BASE;
    const { useWebSession } = await import("~/server/web-session");
    await expect(useWebSession()).rejects.toThrow("SECRET_KEY_BASE is not set");
  });
});
