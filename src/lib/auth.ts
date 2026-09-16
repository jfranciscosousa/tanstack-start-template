import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";

// oxlint-disable-next-line import/no-namespace
import * as schema from "~/server/db/schema";
import { db } from "~/server/db";

function appUrl() {
  // On previews, use the deployment-specific host so auth works on preview
  // URLs. On production, VERCEL_URL is the immutable deployment URL
  // (myapp-<hash>.vercel.app), not the custom domain, so preference goes to
  // VERCEL_PROJECT_PRODUCTION_URL.
  const vercelUrl =
    process.env.APP_ENV === "preview"
      ? process.env.VERCEL_URL
      : (process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL);

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
  },
  user: {
    changeEmail: {
      enabled: true,
      // It would be an extremely unsafe practice to keep this enabled after email delivery is implemented.
      updateEmailWithoutVerification: true,
    },
    additionalFields: {
      theme: {
        type: "string",
        defaultValue: "dark",
        input: false,
      },
    },
  },
});
