import { describe, expect, it } from "vitest";

import { signUpSchema, updateUserSchema } from "./user-schemas";

describe("user schemas", () => {
  it("accepts matching signup passwords", () => {
    const result = signUpSchema.parse({
      email: "user@example.com",
      name: "User",
      password: "password123",
      passwordConfirmation: "password123",
    });

    expect(result.password).toBe("password123");
  });

  it("rejects mismatched signup passwords", () => {
    const result = signUpSchema.safeParse({
      email: "user@example.com",
      name: "User",
      password: "password123",
      passwordConfirmation: "different123",
    });

    if (result.success) expect.fail("Expected validation to fail");
    expect(result.error.issues).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Passwords do not match",
          path: ["passwordConfirmation"],
        }),
      ])
    );
  });

  it("accepts matching profile passwords", () => {
    const result = updateUserSchema.parse({
      currentPassword: "old-password",
      password: "new-password",
      passwordConfirmation: "new-password",
    });

    expect(result.password).toBe("new-password");
  });

  it("rejects mismatched profile passwords", () => {
    const result = updateUserSchema.safeParse({
      currentPassword: "old-password",
      password: "new-password",
      passwordConfirmation: "different-password",
    });

    if (result.success) expect.fail("Expected validation to fail");
    expect(result.error.issues).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Passwords do not match",
          path: ["passwordConfirmation"],
        }),
      ])
    );
  });
});
