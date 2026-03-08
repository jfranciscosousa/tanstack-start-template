import { describe, it, expect, vi } from "vitest";
import { toast } from "sonner";
import userEvent from "@testing-library/user-event";

import { render, screen, waitFor } from "~/test/utils";
import type { Session } from "~/server/db/schema";

import { SessionsTab } from "./sessions-tab";

const mockRevokeFn = vi.fn();
const mockInvalidate = vi.fn();

vi.mock("sonner", () => ({ toast: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => mockRevokeFn }));
vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({
    invalidate: mockInvalidate.mockResolvedValue(undefined),
  }),
}));
vi.mock("~/server/handlers/session-handlers", () => ({ revokeSession: {} }));

const baseSession: Session = {
  id: "session-1",
  userId: "user-1",
  ipAddress: "192.168.1.1",
  location: "New York, US",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  expiresAt: new Date("2024-07-01T00:00:00.000Z"),
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-06-01T12:00:00.000Z"),
};

const mockSessions: Session[] = [
  {
    ...baseSession,
    id: "session-1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0)",
  },
  {
    ...baseSession,
    id: "session-2",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS)",
    ipAddress: "10.0.0.2",
    location: "Los Angeles, US",
  },
  {
    ...baseSession,
    id: "session-3",
    userAgent: "Mozilla/5.0 (iPad)",
    ipAddress: "10.0.0.3",
    location: null,
  },
];

describe("SessionsTab", () => {
  it("renders all sessions", () => {
    render(
      <SessionsTab sessions={mockSessions} currentSessionId="session-1" />
    );

    // One Desktop, one Mobile Device, one Tablet
    expect(screen.getAllByText("Desktop")).toHaveLength(1);
    expect(screen.getByText("Mobile Device")).toBeInTheDocument();
    expect(screen.getByText("Tablet")).toBeInTheDocument();
  });

  it("marks the current session with a 'Current' badge and no revoke button", () => {
    render(
      <SessionsTab sessions={mockSessions} currentSessionId="session-1" />
    );

    expect(screen.getByText("Current")).toBeInTheDocument();
    // Two non-current sessions → two Revoke buttons
    expect(screen.getAllByRole("button", { name: /revoke/i })).toHaveLength(2);
  });

  it("shows location and IP address for sessions that have them", () => {
    render(
      <SessionsTab sessions={mockSessions} currentSessionId="session-1" />
    );

    expect(screen.getByText("New York, US")).toBeInTheDocument();
    expect(screen.getByText("192.168.1.1")).toBeInTheDocument();
    expect(screen.getByText("Los Angeles, US")).toBeInTheDocument();
    expect(screen.getByText("10.0.0.2")).toBeInTheDocument();
  });

  it("shows an empty state when there are no sessions", () => {
    render(<SessionsTab sessions={[]} currentSessionId={undefined} />);

    expect(screen.getByText("No active sessions")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /revoke/i })
    ).not.toBeInTheDocument();
  });

  it("calls the revoke server function and shows a toast on success", async () => {
    const user = userEvent.setup();
    render(
      <SessionsTab sessions={mockSessions} currentSessionId="session-1" />
    );

    const [revokeBtn] = screen.getAllByRole("button", { name: /revoke/i });
    await user.click(revokeBtn);

    await waitFor(() => {
      expect(mockRevokeFn).toHaveBeenCalledWith({ data: "session-2" });
    });
    expect(mockInvalidate).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith("Session revoked successfully!");
  });

  it("does not render a revoke button for the current session", () => {
    render(
      <SessionsTab sessions={mockSessions} currentSessionId="session-2" />
    );

    expect(screen.getByText("Current")).toBeInTheDocument();
    // Session 1 and session 3 are non-current → two buttons
    expect(screen.getAllByRole("button", { name: /revoke/i })).toHaveLength(2);
  });
});
