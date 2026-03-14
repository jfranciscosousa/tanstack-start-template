import { Resend } from "resend";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";

// oxlint-disable-next-line import/no-namespace
import * as schema from "~/server/db/schema";
import { db } from "~/server/db";

const resend = new Resend(process.env.RESEND_API_KEY);

function appUrl() {
  const vercelUrl = process.env.VERCEL_BRANCH_URL;

  if (vercelUrl) return `https://${vercelUrl}`;

  return process.env.BETTER_AUTH_URL;
}

export const auth = betterAuth({
  baseURL: appUrl(),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.DISABLE_EMAIL_VERIFICATION !== "true",
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // VerifyEmailTemplate imported here to avoid circular deps
      const { VerifyEmailTemplate } = await import("~/emails/verify-email");

      await resend.emails.send({
        from: "noreply@yourdomain.com",
        to: user.email,
        subject: "Verify your email address",
        // oxlint-disable-next-line new-cap
        react: VerifyEmailTemplate({ verificationUrl: url }),
      });
    },
  },
  user: {
    additionalFields: {
      theme: {
        type: "string",
        defaultValue: "dark",
        input: false,
      },
    },
  },
});
