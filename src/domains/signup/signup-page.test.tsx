import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { render, screen, waitFor } from "~/test/utils";

import SignupPage from "./signup-page";

const mockSignUp =
  vi.fn<
    (input: {
      name: string;
      email: string;
      password: string;
    }) => Promise<unknown>
  >();
const mockNavigate = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

vi.mock("~/lib/auth-client", () => ({
  authClient: {
    signUp: {
      email: (input: { name: string; email: string; password: string }) =>
        mockSignUp(input),
    },
  },
}));
vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({ navigate: mockNavigate }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));
vi.mock("~/routes/_unauthed/signup", () => ({
  Route: { useSearch: () => ({ redirectUrl: undefined }) },
}));

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<{
    name: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }> = {}
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
    values.passwordConfirmation
  );
  await user.click(screen.getByRole("button", { name: /create account/i }));
}

describe("signupPage", () => {
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

  it("calls authClient.signUp.email with all field values on submit", async () => {
    mockSignUp.mockResolvedValueOnce({ error: null });
    const user = userEvent.setup();
    render(<SignupPage />);

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
      });
    });
  });

  it("blocks submission and shows an error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await fillAndSubmit(user, { passwordConfirmation: "different" });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("does not submit when required fields are empty", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  it("shows a server error alert when the signup function throws", async () => {
    mockSignUp.mockResolvedValueOnce({
      error: { message: "Email already taken" },
    });
    const user = userEvent.setup();
    render(<SignupPage />);

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
