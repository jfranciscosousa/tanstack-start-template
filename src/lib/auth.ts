import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";

// oxlint-disable-next-line import/no-namespace
import * as schema from "~/server/db/schema";
import { db } from "~/server/db";

function appUrl() {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

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
