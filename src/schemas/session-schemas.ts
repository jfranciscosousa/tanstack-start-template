import z from "zod";

export const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().max(128),
  redirectUrl: z
    .string()
    .refine(
      url => url === "" || (url.startsWith("/") && !url.startsWith("//")),
      { message: "Invalid redirect URL" }
    )
    .default(""),
});
