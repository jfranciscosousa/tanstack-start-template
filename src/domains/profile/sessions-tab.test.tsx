import { describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import userEvent from "@testing-library/user-event";

import type { SessionView } from "~/server/handlers/session-handlers";

import { render, screen, waitFor } from "~/test/utils";

import { SessionsTab } from "./sessions-tab";

const mockRevokeFn = vi.fn<() => Promise<unknown>>();
const mockInvalidate = vi.fn<() => Promise<void>>();

vi.mock("sonner", () => ({ toast: vi.fn<() => void>() }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => mockRevokeFn }));
vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({
    invalidate: mockInvalidate.mockResolvedValue(undefined),
  }),
}));
vi.mock("~/server/handlers/session-handlers", () => ({ revokeSession: {} }));

const baseSession: SessionView = {
  id: "session-1",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  expiresAt: new Date("2024-07-01T00:00:00.000Z"),
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-06-01T12:00:00.000Z"),
  isCurrent: true,
};

const mockSessions: SessionView[] = [
  {
    ...baseSession,
    userAgent: "Mozilla/5.0 (Windows NT 10.0)",
  },
  {
    ...baseSession,
    id: "session-2",
    isCurrent: false,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS)",
    ipAddress: "10.0.0.2",
  },
  {
    ...baseSession,
    id: "session-3",
    isCurrent: false,
    userAgent: "Mozilla/5.0 (iPad)",
    ipAddress: "10.0.0.3",
  },
];

describe("sessionsTab", () => {
  it("renders all sessions", () => {
    render(<SessionsTab sessions={mockSessions} />);

    expect(screen.getAllByText("Desktop")).toHaveLength(1);
    expect(screen.getByText("Mobile Device")).toBeInTheDocument();
    expect(screen.getByText("Tablet")).toBeInTheDocument();
  });

  it("marks the current session with a 'Current' badge and no revoke button", () => {
    render(<SessionsTab sessions={mockSessions} />);

    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /revoke/i })).toHaveLength(2);
  });

  it("shows IP address for sessions that have them", () => {
    render(<SessionsTab sessions={mockSessions} />);

    expect(screen.getByText("192.168.1.1")).toBeInTheDocument();
    expect(screen.getByText("10.0.0.2")).toBeInTheDocument();
  });

  it("shows an empty state when there are no sessions", () => {
    render(<SessionsTab sessions={[]} />);

    expect(screen.getByText("No active sessions")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /revoke/i })
    ).not.toBeInTheDocument();
  });

  it("revokes by non-secret session id and shows a toast", async () => {
    const user = userEvent.setup();
    render(<SessionsTab sessions={mockSessions} />);

    const revokeButton = screen
      .getAllByRole("button", { name: /revoke/i })
      .at(0);
    if (!revokeButton) throw new Error("Expected a revoke button");
    await user.click(revokeButton);

    await waitFor(() => {
      expect(mockRevokeFn).toHaveBeenCalledWith({ data: "session-2" });
    });
    expect(mockInvalidate).toHaveBeenCalledWith();
    expect(toast).toHaveBeenCalledWith("Session revoked successfully!");
  });

  it("uses the server-provided current-session marker", () => {
    const sessions = mockSessions.map(session => ({
      ...session,
      isCurrent: session.id === "session-2",
    }));
    render(<SessionsTab sessions={sessions} />);

    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /revoke/i })).toHaveLength(2);
  });
});
