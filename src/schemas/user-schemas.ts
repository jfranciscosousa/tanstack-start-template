import z from "zod";

export const signUpSchema = z.object({
  email: z.email().max(255),
  name: z.string().min(1).max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  passwordConfirmation: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  redirectUrl: z
    .string()
    .max(2048)
    .refine(
      (url) => url === "" || (url.startsWith("/") && !url.startsWith("//")),
      { message: "Invalid redirect URL" },
    )
    .default(""),
});

export type SignUpSchemaType = z.infer<typeof signUpSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  currentPassword: z.string().max(128),
  password: z
    .string()
    .max(128)
    .refine((val) => val === "" || val.length >= 8, {
      message: "Password must be at least 8 characters",
    })
    .default(""),
  passwordConfirmation: z
    .string()
    .max(128)
    .refine((val) => val === "" || val.length >= 8, {
      message: "Password must be at least 8 characters",
    })
    .default(""),
});

export const updateThemeSchema = z.object({ theme: z.enum(["dark", "light"]) });
