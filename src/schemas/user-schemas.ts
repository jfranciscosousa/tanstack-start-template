import z from "zod";

export const signUpSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
  password: z.string().min(1),
  passwordConfirmation: z.string().min(1),
  redirectUrl: z.string().optional(),
});

export type SignUpSchemaType = z.infer<typeof signUpSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  currentPassword: z.string().min(1, "Current password is required"),
  password: z.string(),
  passwordConfirmation: z.string(),
});

export const updateThemeSchema = z.object({ theme: z.enum(["dark", "light"]) });
