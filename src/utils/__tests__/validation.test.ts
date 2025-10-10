import { describe, it, expect } from "vitest";
import { z } from "zod";

// Common validation schemas used in the app
const emailSchema = z.string().email("Invalid email format");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must not exceed 100 characters");

const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(50, "Name must not exceed 50 characters");

describe("Validation schemas", () => {
  describe("Email validation", () => {
    it("should accept valid email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.org",
      ];

      validEmails.forEach(email => {
        expect(emailSchema.safeParse(email).success).toBe(true);
      });
    });

    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "",
        "invalid",
        "@domain.com",
        "user@",
        "user@.com",
      ];

      invalidEmails.forEach(email => {
        expect(emailSchema.safeParse(email).success).toBe(false);
      });
    });
  });

  describe("Password validation", () => {
    it("should accept valid passwords", () => {
      const validPasswords = [
        "password123",
        "MySecurePassword!",
        "a".repeat(8), // minimum length
        "a".repeat(100), // maximum length
      ];

      validPasswords.forEach(password => {
        expect(passwordSchema.safeParse(password).success).toBe(true);
      });
    });

    it("should reject invalid passwords", () => {
      const invalidPasswords = [
        "", // empty
        "short", // too short
        "a".repeat(101), // too long
      ];

      invalidPasswords.forEach(password => {
        expect(passwordSchema.safeParse(password).success).toBe(false);
      });
    });
  });

  describe("Name validation", () => {
    it("should accept valid names", () => {
      const validNames = ["John", "Jane Doe", "María García", "a".repeat(50)];

      validNames.forEach(name => {
        expect(nameSchema.safeParse(name).success).toBe(true);
      });
    });

    it("should reject invalid names", () => {
      const invalidNames = ["", "a".repeat(51)];

      invalidNames.forEach(name => {
        expect(nameSchema.safeParse(name).success).toBe(false);
      });
    });
  });
});
