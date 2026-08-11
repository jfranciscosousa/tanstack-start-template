import z from "zod";
import { describe, expect, it } from "vitest";

import { AppError, renderError } from "./index";

describe("renderError", () => {
  it("renders the public message from an AppError", () => {
    const error = new AppError("NOT_FOUND", "Session not found");

    expect(renderError(error)).toBe("Session not found");
  });

  it("renders a serialized AppError public message", () => {
    const appError = new AppError("FORBIDDEN", "You cannot do that");
    const serializedError = new Error(appError.message);

    expect(renderError(serializedError)).toBe("You cannot do that");
  });

  it("does not render messages from unexpected errors", () => {
    const error = new Error(
      'duplicate key violates constraint "users_email_unique"'
    );

    expect(renderError(error)).toBe("An unexpected error occurred.");
  });

  it("renders a stable message for Zod errors", () => {
    const result = z.string().min(1).safeParse("");
    if (result.success) expect.fail("Expected validation to fail");

    expect(renderError(result.error)).toBe(
      "The request was well-formed but was unable to be followed due to semantic errors."
    );
  });
});
