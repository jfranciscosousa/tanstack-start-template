import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "~/test/utils";
import { toast } from "sonner";

import { ProfileTab } from "./profile-tab";

const mockUser = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-06-01T00:00:00.000Z"),
  theme: "light" as const,
};
const mockUpdateFn = vi.fn();
const mockNavigate = vi.fn();
const mockInvalidate = vi.fn();

vi.mock("sonner", () => ({ toast: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => mockUpdateFn }));
vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({
    navigate: mockNavigate,
    invalidate: mockInvalidate.mockResolvedValue(undefined),
  }),
}));
vi.mock("~/routes/__root", () => ({ useCurrentUser: () => mockUser }));
vi.mock("~/server/handlers/user-handlers", () => ({ updateUserFn: {} }));

describe("ProfileTab", () => {
  it("pre-fills the form with the current user's name and email", () => {
    render(<ProfileTab />);

    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
  });

  it("renders the account information section with formatted dates", () => {
    render(<ProfileTab />);

    expect(screen.getByText("Account Information")).toBeInTheDocument();
    expect(screen.getByText("Member Since")).toBeInTheDocument();
    expect(screen.getByText("Last Updated")).toBeInTheDocument();
    // Dates formatted as "January 1, 2024"
    expect(screen.getByText("January 1, 2024")).toBeInTheDocument();
    expect(screen.getByText("June 1, 2024")).toBeInTheDocument();
  });

  it("calls the update server function and shows a toast on successful submit", async () => {
    const user = userEvent.setup();
    render(<ProfileTab />);

    const nameInput = screen.getByDisplayValue("John Doe");
    await user.clear(nameInput);
    await user.type(nameInput, "Jane Doe");

    const currentPasswordInput = screen.getByLabelText("Current Password");
    await user.type(currentPasswordInput, "mypassword");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateFn).toHaveBeenCalledWith({
        data: {
          name: "Jane Doe",
          email: "john@example.com",
          currentPassword: "mypassword",
          password: "",
          passwordConfirmation: "",
        },
      });
    });
    expect(mockInvalidate).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith("Profile updated successfully!");
  });

  it("also updates the password when new password fields are filled", async () => {
    const user = userEvent.setup();
    render(<ProfileTab />);

    await user.type(screen.getByLabelText("Current Password"), "oldpass");
    await user.type(screen.getByLabelText("New Password"), "newpass123");
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      "newpass123",
    );

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateFn).toHaveBeenCalledWith({
        data: {
          name: "John Doe",
          email: "john@example.com",
          currentPassword: "oldpass",
          password: "newpass123",
          passwordConfirmation: "newpass123",
        },
      });
    });
  });

  it("navigates to home when the cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<ProfileTab />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
  });

  it("blocks submission and shows an error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<ProfileTab />);

    await user.type(screen.getByLabelText("Current Password"), "oldpass");
    await user.type(screen.getByLabelText("New Password"), "newpass123");
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      "differentpass",
    );

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText("Passwords must match")).toBeInTheDocument();
    });
    expect(mockUpdateFn).not.toHaveBeenCalled();
  });

  it("does not submit and shows validation errors when required fields are empty", async () => {
    const user = userEvent.setup();
    render(<ProfileTab />);

    const nameInput = screen.getByDisplayValue("John Doe");
    await user.clear(nameInput);

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateFn).not.toHaveBeenCalled();
    });
  });
});
