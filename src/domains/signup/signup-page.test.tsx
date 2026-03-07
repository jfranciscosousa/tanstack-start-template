import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "~/test/utils";

import SignupPage from "./signup-page";

const mockSignupFn = vi.fn();
const mockInvalidate = vi.fn();

vi.mock("@tanstack/react-start", () => ({ useServerFn: () => mockSignupFn }));
vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({ invalidate: mockInvalidate.mockResolvedValue(undefined) }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));
vi.mock("~/routes/_unauthed/signup", () => ({
  Route: { useSearch: () => ({ redirectUrl: undefined }) },
}));
vi.mock("~/server/handlers/user-handlers", () => ({ signupFn: {} }));

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<{
    name: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }> = {},
) {
  const values = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password123",
    passwordConfirmation: "password123",
    ...overrides,
  };

  await user.type(screen.getByLabelText("Name"), values.name);
  await user.type(screen.getByLabelText("Email"), values.email);
  await user.type(screen.getByLabelText("Password"), values.password);
  await user.type(
    screen.getByLabelText("Confirm password"),
    values.passwordConfirmation,
  );
  await user.click(screen.getByRole("button", { name: /create account/i }));
}

describe("SignupPage", () => {
  it("renders all form fields", () => {
    render(<SignupPage />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
  });

  it("renders the sign-in link", () => {
    render(<SignupPage />);

    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  it("calls the signup server function with all field values on submit", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(mockSignupFn).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Jane Doe",
          email: "jane@example.com",
          password: "password123",
          passwordConfirmation: "password123",
        }),
      });
    });
    expect(mockInvalidate).toHaveBeenCalled();
  });

  it("blocks submission and shows an error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await fillAndSubmit(user, { passwordConfirmation: "different" });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(mockSignupFn).not.toHaveBeenCalled();
  });

  it("does not submit when required fields are empty", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockSignupFn).not.toHaveBeenCalled();
    });
  });

  it("shows a server error alert when the signup function throws", async () => {
    mockSignupFn.mockRejectedValueOnce(new Error("Email already taken"));
    const user = userEvent.setup();
    render(<SignupPage />);

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
