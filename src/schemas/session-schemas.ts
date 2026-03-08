import z from "zod";

export const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  redirectUrl: z
    .string()
    .refine(
      (url) => url === "" || (url.startsWith("/") && !url.startsWith("//")),
      { message: "Invalid redirect URL" }
    )
    .default(""),
});
