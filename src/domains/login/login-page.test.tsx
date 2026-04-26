import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { render, screen, waitFor } from "~/test/utils";

import LoginPage from "./login-page";

const mockSignIn = vi.fn();
const mockNavigate = vi.fn().mockResolvedValue(undefined);
const mockInvalidate = vi.fn().mockResolvedValue(undefined);
const mockUseSearch = vi.fn().mockReturnValue({ redirectUrl: undefined });

vi.mock("~/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: (input: { email: string; password: string }) => mockSignIn(input),
    },
  },
}));
vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({ navigate: mockNavigate, invalidate: mockInvalidate }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));
vi.mock("~/routes/_unauthed/login", () => ({
  Route: { useSearch: () => mockUseSearch() },
}));

describe("loginPage", () => {
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

  it("calls authClient.signIn.email with email and password on submit", async () => {
    mockSignIn.mockResolvedValueOnce({ error: null });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: "john@example.com",
        password: "secret123",
      });
    });
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
  });

  it("navigates to redirectUrl after successful login", async () => {
    mockUseSearch.mockReturnValue({ redirectUrl: "/dashboard" });
    mockSignIn.mockResolvedValueOnce({ error: null });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
    });
  });

  it("does not submit when required fields are empty", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  it("shows a server error alert when the login function throws", async () => {
    mockSignIn.mockResolvedValueOnce({
      error: { message: "Invalid credentials" },
    });
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
