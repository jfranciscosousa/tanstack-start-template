import { describe, it, expect } from "vitest";
import { render, screen } from "../../test/utils";
import { TextInput } from "../TextInput";
import { Mail } from "lucide-react";

describe("TextInput", () => {
  it("renders with label", () => {
    render(<TextInput label="Email" />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("renders with icon", () => {
    render(<TextInput label="Email" icon={Mail} />);

    const label = screen.getByText("Email");
    expect(label).toBeInTheDocument();

    // Icon should be rendered within the label
    const labelContainer = label.closest(".label-text");
    expect(labelContainer).toHaveClass("flex", "items-center", "gap-2");
  });

  it("displays error message when error is provided", () => {
    render(<TextInput label="Email" error="Invalid email" />);

    expect(screen.getByText("Invalid email")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveClass("input-error");
  });

  it("displays multiple error messages", () => {
    render(<TextInput label="Email" error={["Required", "Invalid format"]} />);

    expect(screen.getByText("Required, Invalid format")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<TextInput label="Email" className="custom-class" />);

    expect(screen.getByLabelText("Email")).toHaveClass("custom-class");
  });

  it("forwards input props", () => {
    render(
      <TextInput
        label="Email"
        placeholder="Enter your email"
        type="email"
        data-testid="email-input"
      />
    );

    const input = screen.getByTestId("email-input");
    expect(input).toHaveAttribute("placeholder", "Enter your email");
    expect(input).toHaveAttribute("type", "email");
  });
});
