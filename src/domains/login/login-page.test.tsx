import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { render, screen, waitFor } from "~/test/utils";

import LoginPage from "./login-page";

const mockLoginFn = vi.fn();
const mockInvalidate = vi.fn();
const mockUseSearch = vi.fn().mockReturnValue({ redirectUrl: undefined });

vi.mock("@tanstack/react-start", () => ({ useServerFn: () => mockLoginFn }));
vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({
    invalidate: mockInvalidate.mockResolvedValue(undefined),
  }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));
vi.mock("~/routes/_unauthed/login", () => ({
  Route: { useSearch: () => mockUseSearch() },
}));
vi.mock("~/server/handlers/session-handlers", () => ({ loginFn: {} }));

describe("LoginPage", () => {
  it("renders the email and password fields", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders the sign-up link", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("link", { name: /create one/i })
    ).toBeInTheDocument();
  });

  it("calls the login server function with email and password on submit", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLoginFn).toHaveBeenCalledWith({
        data: {
          email: "john@example.com",
          password: "secret123",
          redirectUrl: "",
        },
      });
    });
    expect(mockInvalidate).toHaveBeenCalled();
  });

  it("includes the redirectUrl from search params in the submitted data", async () => {
    mockUseSearch.mockReturnValue({ redirectUrl: "/dashboard" });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLoginFn).toHaveBeenCalledWith({
        data: {
          email: "john@example.com",
          password: "secret123",
          redirectUrl: "/dashboard",
        },
      });
    });
  });

  it("does not submit when required fields are empty", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLoginFn).not.toHaveBeenCalled();
    });
  });

  it("shows a server error alert when the login function throws", async () => {
    mockLoginFn.mockRejectedValueOnce(new Error("Invalid credentials"));
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });
});
