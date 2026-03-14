# Better-Auth Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hand-rolled email/password auth system with better-auth, adding email verification via Resend + React Email, and structuring it for easy OAuth extension later.

**Architecture:** better-auth owns the `user`, `session`, `account`, and `verification` tables via its Drizzle adapter. Login/signup/logout become client-side calls via `authClient`. Session checks, session listing/revocation, and profile updates remain as TanStack Start server functions that call `auth.api.*`. Email verification is sent with Resend using a React Email template.

**Tech Stack:** `better-auth`, `@react-email/components`, `react-email`, `resend`, Drizzle ORM (PostgreSQL), TanStack Start server functions, Vitest (unit), Playwright (E2E)

**Spec:** `docs/superpowers/specs/2026-03-14-better-auth-migration-design.md`

---

## File Map

### Created
| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | better-auth server instance |
| `src/lib/auth-client.ts` | better-auth React client |
| `src/routes/api/auth/$.tsx` | Wildcard API route proxying `/api/auth/**` to better-auth |
| `src/emails/verify-email.tsx` | React Email template for verification emails |
| `src/routes/_unauthed/verify-email.tsx` | "Check your inbox" page shown after signup |
| `src/routes/api/test/create-user.tsx` | Test-only endpoint for E2E user creation |

### Deleted
| File | Reason |
|------|--------|
| `src/server/web-session.ts` | Replaced by `auth.api.getSession()` |
| `src/server/services/password-service.ts` | better-auth handles hashing internally |
| `src/server/services/session-service.ts` | better-auth handles session CRUD |
| `src/routes/logout.tsx` | Logout is now client-side via `authClient.signOut()` |
| `src/server/web-session.server.test.ts` | Tests deleted file |
| `src/server/services/passwords.server.test.ts` | Tests deleted file |
| `src/server/services/session-service.server.test.ts` | Tests deleted file |

### Modified
| File | Change Summary |
|------|---------------|
| `src/server/db/schema.ts` | Remove `users`/`sessions`, add better-auth tables, keep `todos` with updated FK |
| `src/server/handlers/session-handlers.ts` | Strip to `fetchUserSessions` + `revokeSession` (token-based) |
| `src/server/handlers/user-handlers.ts` | Strip to `updateUserFn` + `updateThemeFn` |
| `src/server/services/user-services.ts` | Strip to `updateUserTheme` only |
| `src/routes/__root.tsx` | `fetchCurrentUser` uses `auth.api.getSession` |
| `src/domains/login/login-page.tsx` | Use `authClient.signIn.email()` |
| `src/domains/signup/signup-page.tsx` | Use `authClient.signUp.email()`, redirect to `/verify-email` |
| `src/components/navbar.tsx` | Client-side `authClient.signOut()` instead of Link to `/logout` |
| `src/domains/profile/sessions-tab.tsx` | Token-based session ID, remove `location` field |
| `src/domains/profile/profile-page.tsx` | `currentSessionId` → `currentSessionToken` |
| `src/routes/_authed/profile.tsx` | `currentSessionId` → `currentSessionToken` |
| `src/schemas/user-schemas.ts` | Make `currentPassword` optional (only needed when changing password) |
| `src/test/server-utils.ts` | Rewrite: `createTestUser` inserts into `user` table; mock helpers for `auth.api` |
| `src/server/handlers/session-handlers.server.test.ts` | Rewrite for new handler signatures |
| `src/server/handlers/user-handlers.server.test.ts` | Rewrite for new handler signatures |
| `src/server/services/user-services.server.test.ts` | Keep only `updateUserTheme` test |
| `src/test/e2e/truncateAll.ts` | Update table names to better-auth tables |
| `src/test/e2e/utils.ts` | `createUserAndLogin` uses test API endpoint |
| `src/test/e2e/authentication.test.ts` | Signup test: no email verification redirect in test env |

---

## Chunk 1: Packages & Auth Infrastructure

### Task 1: Install & remove packages

**Files:** `package.json`

- [ ] **Step 1: Install better-auth and email packages**

```bash
pnpm add better-auth @react-email/components react-email resend
```

- [ ] **Step 2: Remove bcrypt-ts**

```bash
pnpm remove bcrypt-ts
```

- [ ] **Step 3: Document required environment variables**

Add to `.env` (and `.env.example` if it exists):
```
BETTER_AUTH_SECRET=your-random-32-char-secret-here
BETTER_AUTH_URL=http://localhost:3000
RESEND_API_KEY=re_your_resend_api_key
DISABLE_EMAIL_VERIFICATION=false
```

Remove `SECRET_KEY_BASE` from `.env`.

---

### Task 2: Create `src/lib/auth.ts`

**Files:**
- Create: `src/lib/auth.ts`

- [ ] **Step 1: Create the server-side better-auth instance**

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";

import { db } from "~/server/db";
import * as schema from "~/server/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification:
      process.env.DISABLE_EMAIL_VERIFICATION !== "true",
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // VerifyEmailTemplate imported here to avoid circular deps
      const { VerifyEmailTemplate } = await import("~/emails/verify-email");
      await resend.emails.send({
        from: "noreply@yourdomain.com",
        to: user.email,
        subject: "Verify your email address",
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
  advanced: {
    generateId: () => crypto.randomUUID(),
  },
});
```

> Note: `src/emails/verify-email.tsx` doesn't exist yet. The dynamic import avoids breaking the build until Task 9.

---

### Task 3: Create `src/lib/auth-client.ts`

**Files:**
- Create: `src/lib/auth-client.ts`

- [ ] **Step 1: Create the client-side auth instance**

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
```

better-auth infers the base URL from the current window location in the browser. No configuration needed for same-origin.

---

### Task 4: Create the better-auth API route

**Files:**
- Create: `src/routes/api/auth/$.tsx`

- [ ] **Step 1: Create the wildcard API route**

```tsx
import { createAPIFileRoute } from "@tanstack/react-start/api";

import { auth } from "~/lib/auth";

export const APIRoute = createAPIFileRoute("/api/auth/$")({
  GET: ({ request }) => auth.handler(request),
  POST: ({ request }) => auth.handler(request),
});
```

This catches all `/api/auth/**` requests (sign-in, sign-up, sign-out, verify-email, etc.) and delegates them to better-auth.

- [ ] **Step 2: Run type check**

```bash
pnpm tsc --noEmit
```

Expected: errors about missing `~/server/db/schema` exports (`user`, `session`, `account`, `verification`) — this is fine, we fix this in the next chunk.

---

## Chunk 2: DB Schema & Migration

### Task 5: Rewrite `src/server/db/schema.ts`

**Files:**
- Modify: `src/server/db/schema.ts`

- [ ] **Step 1: Replace the entire schema file**

```ts
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── better-auth tables ───────────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  // additionalField: theme
  theme: text("theme", { enum: ["dark", "light"] }).notNull().default("dark"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ─── Application tables ───────────────────────────────────────────────────────

export const todos = pgTable(
  "todos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  table => [index("todos_user_id_idx").on(table.userId)]
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  todos: many(todos),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(user, { fields: [todos.userId], references: [user.id] }),
}));

// ─── Type exports ─────────────────────────────────────────────────────────────

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
```

- [ ] **Step 2: Run type check to verify schema compiles**

```bash
pnpm tsc --noEmit
```

Expected: errors about files that still reference old types (`UserWithoutPassword`, `sessions` table, etc.) — this is expected and will be resolved in later tasks.

---

### Task 6: Generate and run the DB migration

**Files:**
- Create: `drizzle/` migration files (auto-generated)

- [ ] **Step 1: Generate the migration**

```bash
pnpm drizzle-kit generate
```

Review the generated SQL in `drizzle/`. It should drop `users`, `sessions` tables and create `user`, `session`, `account`, `verification` tables. The `todos` table FK column type changes from `uuid` to `text`.

> **For a template repo with no production data, a destructive migration is acceptable.** If there's data to preserve, write a custom migration that renames tables and migrates data.

- [ ] **Step 2: Apply the migration**

```bash
pnpm drizzle-kit migrate
```

Expected: migration applied successfully.

---

## Chunk 3: Server-Side Auth Core

### Task 7: Delete obsolete server files

**Files:**
- Delete: `src/server/web-session.ts`
- Delete: `src/server/services/password-service.ts`
- Delete: `src/server/services/session-service.ts`

- [ ] **Step 1: Delete the three files**

```bash
rm src/server/web-session.ts
rm src/server/services/password-service.ts
rm src/server/services/session-service.ts
```

---

### Task 8: Rewrite `src/server/services/user-services.ts`

**Files:**
- Modify: `src/server/services/user-services.ts`

- [ ] **Step 1: Strip down to only `updateUserTheme`**

```ts
import { eq } from "drizzle-orm";
import { createServerOnlyFn } from "@tanstack/react-start";

import { user } from "../db/schema";
import { db } from "../db";

export const updateUserTheme = createServerOnlyFn(
  async (userId: string, theme: "dark" | "light") => {
    await db.update(user).set({ theme }).where(eq(user.id, userId));
  }
);
```

---

### Task 9: Rewrite `src/server/handlers/session-handlers.ts`

**Files:**
- Modify: `src/server/handlers/session-handlers.ts`

- [ ] **Step 1: Replace with fetchUserSessions and revokeSession only**

```ts
import z from "zod";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { AppError } from "~/errors";
import { auth } from "~/lib/auth";

export const fetchUserSessions = createServerFn({ method: "GET" }).handler(
  async () => {
    const req = getRequest();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      throw new AppError(
        "UNAUTHORIZED",
        "You must be logged in to view sessions"
      );
    }

    const sessions = await auth.api.listSessions({ headers: req.headers });

    return {
      currentSessionToken: session.session.token,
      sessions,
    };
  }
);

export const revokeSession = createServerFn({ method: "POST" })
  .inputValidator((token: unknown) => z.string().parse(token))
  .handler(async ({ data: token }) => {
    const req = getRequest();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      throw new AppError("UNAUTHORIZED", "You must be logged in");
    }

    if (token === session.session.token) {
      throw new AppError("BAD_REQUEST", "Cannot revoke your current session");
    }

    await auth.api.revokeSession({
      headers: req.headers,
      body: { token },
    });
  });
```

---

### Task 10: Rewrite `src/server/handlers/user-handlers.ts`

**Files:**
- Modify: `src/server/handlers/user-handlers.ts`

- [ ] **Step 1: Replace with updateUserFn and updateThemeFn only**

```ts
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { AppError } from "~/errors";
import { auth } from "~/lib/auth";
import { updateUserTheme } from "~/server/services/user-services";
import { updateUserSchema, updateThemeSchema } from "~/schemas/user-schemas";

export { updateUserSchema };

export const updateUserFn = createServerFn({ method: "POST" })
  .inputValidator(updateUserSchema)
  .handler(async ({ data }) => {
    const req = getRequest();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      throw new AppError("NOT_FOUND");
    }

    await auth.api.updateUser({
      headers: req.headers,
      body: { name: data.name, email: data.email },
    });

    if (data.password) {
      await auth.api.changePassword({
        headers: req.headers,
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.password,
          revokeOtherSessions: true,
        },
      });
    }
  });

export const updateThemeFn = createServerFn({ method: "POST" })
  .inputValidator(updateThemeSchema)
  .handler(async ({ data }) => {
    const req = getRequest();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      throw new AppError("NOT_FOUND");
    }

    await updateUserTheme(session.user.id, data.theme);
  });
```

---

### Task 11: Update `src/routes/__root.tsx`

**Files:**
- Modify: `src/routes/__root.tsx`

- [ ] **Step 1: Replace `fetchCurrentUser` to use `auth.api.getSession`**

Replace the import at the top:
```ts
// Remove:
import { fetchCurrentUser } from "~/server/web-session";

// Add:
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "~/lib/auth";
```

Replace `fetchCurrentUser`:
```ts
const fetchCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const req = getRequest();
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
});
```

Update `useCurrentUser` — the `user` type is now `typeof auth.$Infer.Session.user | null`. The `theme` field is `string` not `"dark" | "light"`, so cast it:

```ts
export function useCurrentUser() {
  const user = Route.useLoaderData()?.user;

  if (!user) {
    throw new AppError("NOT_FOUND");
  }

  return user;
}
```

In `RootComponent`, the theme cast:
```tsx
function RootComponent() {
  const { user } = Route.useLoaderData();
  const theme = (user?.theme ?? "dark") as "dark" | "light";

  return (
    <RootDocument theme={theme}>
      <Outlet />
    </RootDocument>
  );
}
```

- [ ] **Step 2: Run type check**

```bash
pnpm tsc --noEmit
```

Expected: remaining errors only in UI files and test files (not yet updated). No errors in the server handler files.

---

### Task 12: Update `src/schemas/user-schemas.ts`

**Files:**
- Modify: `src/schemas/user-schemas.ts`

- [ ] **Step 1: Make `currentPassword` optional (only required when changing password)**

```ts
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
      url => url === "" || (url.startsWith("/") && !url.startsWith("//")),
      { message: "Invalid redirect URL" }
    )
    .default(""),
});

export type SignUpSchemaType = z.infer<typeof signUpSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.email("Invalid email address").max(255),
  // currentPassword is only validated server-side by better-auth when changing password
  currentPassword: z.string().max(128).default(""),
  password: z
    .string()
    .max(128)
    .refine(val => val === "" || val.length >= 8, {
      message: "Password must be at least 8 characters",
    })
    .default(""),
  passwordConfirmation: z
    .string()
    .max(128)
    .refine(val => val === "" || val.length >= 8, {
      message: "Password must be at least 8 characters",
    })
    .default(""),
});

export const updateThemeSchema = z.object({ theme: z.enum(["dark", "light"]) });
```

---

## Chunk 4: Email Template & UI Updates

### Task 13: Create `src/emails/verify-email.tsx`

**Files:**
- Create: `src/emails/verify-email.tsx`

- [ ] **Step 1: Create the React Email template**

```tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface VerifyEmailTemplateProps {
  verificationUrl: string;
}

export function VerifyEmailTemplate({
  verificationUrl,
}: VerifyEmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f4f4f5" }}>
        <Container
          style={{
            margin: "40px auto",
            maxWidth: "560px",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            padding: "40px",
          }}
        >
          <Heading style={{ fontSize: "24px", fontWeight: "bold" }}>
            Verify your email
          </Heading>
          <Text style={{ color: "#6b7280" }}>
            Click the button below to verify your email address and activate
            your account.
          </Text>
          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Button
              href={verificationUrl}
              style={{
                backgroundColor: "#000000",
                color: "#ffffff",
                borderRadius: "6px",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Verify Email
            </Button>
          </Section>
          <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
            If you didn&apos;t create an account, you can ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

---

### Task 14: Create `src/routes/_unauthed/verify-email.tsx`

**Files:**
- Create: `src/routes/_unauthed/verify-email.tsx`

- [ ] **Step 1: Create the "check your inbox" page**

```tsx
import { Mail } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { buttonVariants } from "~/components/ui/button";

export const Route = createFileRoute("/_unauthed/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="relative w-full max-w-sm text-center">
        <div
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 mx-auto"
          aria-hidden="true"
        >
          <Mail size={24} className="text-primary-foreground" />
        </div>

        <h1 className="font-display text-3xl font-bold italic tracking-tight mb-2">
          Check your email.
        </h1>

        <p className="text-sm text-muted-foreground mb-6">
          We&apos;ve sent a verification link to your inbox. Click it to
          activate your account.
        </p>

        <p className="text-sm text-muted-foreground">
          Already verified?{" "}
          <Link
            to="/login"
            className={buttonVariants({
              variant: "link",
              className: "h-auto p-0 text-sm text-primary",
            })}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run `pnpm tsc --noEmit` to check progress**

---

### Task 15: Update `src/domains/login/login-page.tsx`

**Files:**
- Modify: `src/domains/login/login-page.tsx`

- [ ] **Step 1: Replace server function call with authClient**

Remove imports:
```ts
// Remove:
import { useServerFn } from "@tanstack/react-start";
import { loginFn } from "~/server/handlers/session-handlers";
```

Add imports:
```ts
import { authClient } from "~/lib/auth-client";
```

Replace the form `onSubmit`:
```tsx
onSubmit={async values => {
  const { error } = await authClient.signIn.email({
    email: values.email,
    password: values.password,
  });
  if (error) throw new Error(error.message);
  await router.navigate({ to: values.redirectUrl || "/" });
  await router.invalidate();
}}
```

Remove `const login = useServerFn(loginFn);` and the `await login(...)` call.

---

### Task 16: Update `src/domains/signup/signup-page.tsx`

**Files:**
- Modify: `src/domains/signup/signup-page.tsx`

- [ ] **Step 1: Replace server function call with authClient**

Remove imports:
```ts
// Remove:
import { useServerFn } from "@tanstack/react-start";
import { signupFn } from "~/server/handlers/user-handlers";
```

Add imports:
```ts
import { authClient } from "~/lib/auth-client";
```

Replace `onSubmit`:
```tsx
onSubmit={async values => {
  const { error } = await authClient.signUp.email({
    name: values.name,
    email: values.email,
    password: values.password,
  });
  if (error) throw new Error(error.message);
  await router.navigate({ to: "/verify-email" });
}}
```

Remove `const signup = useServerFn(signupFn);`.

---

### Task 17: Update `src/components/navbar.tsx` — client-side logout

**Files:**
- Modify: `src/components/navbar.tsx`

- [ ] **Step 1: Replace the `<Link to="/logout">` with a button calling authClient.signOut**

Remove:
```ts
// Remove:
import { Link } from "@tanstack/react-router";
```

Add (keep `useRouter`):
```ts
import { useRouter } from "@tanstack/react-router";
import { authClient } from "~/lib/auth-client";
```

In the `Navbar` function, add:
```tsx
const router = useRouter();

async function handleSignOut() {
  await authClient.signOut();
  await router.navigate({ to: "/" });
  await router.invalidate();
}
```

Replace the `signOutLink` constant:
```tsx
// Remove:
const signOutLink = (
  <Link to="/logout" className="flex w-full items-center gap-2">
    <LogOut size={14} aria-hidden="true" />
    Sign out
  </Link>
);
```

Replace the `DropdownMenuItem` that renders `signOutLink`:
```tsx
<DropdownMenuItem
  className="text-destructive data-highlighted:text-destructive cursor-pointer"
  onClick={handleSignOut}
>
  <LogOut size={14} aria-hidden="true" />
  Sign out
</DropdownMenuItem>
```

---

### Task 18: Delete `src/routes/logout.tsx`

- [ ] **Step 1: Delete the file**

```bash
rm src/routes/logout.tsx
```

---

### Task 19: Update `src/domains/profile/sessions-tab.tsx`

**Files:**
- Modify: `src/domains/profile/sessions-tab.tsx`

- [ ] **Step 1: Update props, types, and session card**

Change the import — remove old `Session` type, use better-auth's type from the handler return:
```ts
// Remove:
import type { Session } from "~/server/db/schema";
```

Update `SessionsTabProps`:
```ts
interface SessionsTabProps {
  sessions: {
    id: string;
    token: string;
    userId: string;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
  }[];
  currentSessionToken: string | undefined;
}
```

Update `SessionCard` props:
```ts
interface SessionCardProps {
  session: SessionsTabProps["sessions"][number];
  isCurrentSession: boolean;
  onRevoke: (token: string) => void;
  isRevoking: boolean;
}
```

In `SessionCard`, change `handleRevoke` to use `token`:
```tsx
function handleRevoke() {
  onRevoke(session.token);
}
```

Remove the `location` display block entirely (better-auth does not track location).

Update `SessionsTab`:
```tsx
export function SessionsTab({ sessions, currentSessionToken }: SessionsTabProps) {
```

Update `isCurrentSession` check:
```tsx
isCurrentSession={session.token === currentSessionToken}
```

Update `handleRevoke`:
```tsx
function handleRevoke(token: string) {
  revokeMutation.mutate({ data: token });
}
```

Update the `SessionCard` render call to use `onRevoke={handleRevoke}`.

---

### Task 20: Update `src/domains/profile/profile-page.tsx` and route

**Files:**
- Modify: `src/domains/profile/profile-page.tsx`
- Modify: `src/routes/_authed/profile.tsx`

- [ ] **Step 1: Rename `currentSessionId` to `currentSessionToken` in profile page**

In `profile-page.tsx`:
```tsx
const { sessions, currentSessionToken } = Route.useLoaderData();
```

Pass it to `SessionsTab`:
```tsx
<SessionsTab
  sessions={sessions}
  currentSessionToken={currentSessionToken}
/>
```

- [ ] **Step 2: Run type check**

```bash
pnpm tsc --noEmit
```

Expected: only test file errors remain (not yet updated). All source files should be clean.

---

## Chunk 5: Tests

### Task 21: Delete obsolete test files

- [ ] **Step 1: Delete the three test files for deleted modules**

```bash
rm src/server/web-session.server.test.ts
rm src/server/services/passwords.server.test.ts
rm src/server/services/session-service.server.test.ts
```

---

### Task 22: Rewrite `src/test/server-utils.ts`

**Files:**
- Modify: `src/test/server-utils.ts`

- [ ] **Step 1: Rewrite to use better-auth's user table and auth.api mocks**

```ts
import { vi } from "vitest";
import { faker } from "@faker-js/faker";

import { user as userTable } from "~/server/db/schema";
import { db } from "~/server/db";

export type TestUser = typeof userTable.$inferSelect;

export async function createTestUser(): Promise<TestUser> {
  const [created] = await db
    .insert(userTable)
    .values({
      id: crypto.randomUUID(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return created;
}

export function makeSessionMock(
  testUser: TestUser,
  sessionToken = "test-session-token"
) {
  return {
    user: testUser,
    session: {
      id: "test-session-id",
      token: sessionToken,
      userId: testUser.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: null,
      userAgent: null,
    },
  };
}
```

> Note: Individual test files mock `~/lib/auth` themselves with `vi.mock`. `server-utils.ts` only provides DB helpers and mock data factories — no `vi.mock` calls at module level.

---

### Task 23: Rewrite `src/server/handlers/session-handlers.server.test.ts`

**Files:**
- Modify: `src/server/handlers/session-handlers.server.test.ts`

- [ ] **Step 1: Write tests for `fetchUserSessions` and `revokeSession`**

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "~/errors";
import { auth } from "~/lib/auth";
import { createTestUser, makeSessionMock } from "~/test/server-utils";
import type { TestUser } from "~/test/server-utils";

import { fetchUserSessions, revokeSession } from "./session-handlers";

vi.mock("@tanstack/react-start/server", () => ({
  getRequest: () => new Request("http://localhost:3000/"),
}));

vi.mock("~/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      listSessions: vi.fn(),
      revokeSession: vi.fn(),
    },
  },
}));

describe("Session handlers", () => {
  let testUser: TestUser;

  beforeEach(async () => {
    testUser = await createTestUser();
    vi.clearAllMocks();
  });

  describe("fetchUserSessions", () => {
    it("should return sessions and current session token when logged in", async () => {
      const mockSessions = [{ id: "s1", token: "tok1" }, { id: "s2", token: "tok2" }];
      const mockSession = makeSessionMock(testUser, "current-token");

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
      vi.mocked(auth.api.listSessions).mockResolvedValue(mockSessions as any);

      const result = await fetchUserSessions();

      expect(result.currentSessionToken).toBe("current-token");
      expect(result.sessions).toEqual(mockSessions);
    });

    it("should throw UNAUTHORIZED when not logged in", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      try {
        await fetchUserSessions();
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as AppError).code).toBe("UNAUTHORIZED");
      }
    });
  });

  describe("revokeSession", () => {
    it("should call auth.api.revokeSession for a different session token", async () => {
      const mockSession = makeSessionMock(testUser, "current-token");
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
      vi.mocked(auth.api.revokeSession).mockResolvedValue(undefined as any);

      await revokeSession({ data: "other-token" });

      expect(vi.mocked(auth.api.revokeSession)).toHaveBeenCalledWith(
        expect.objectContaining({ body: { token: "other-token" } })
      );
    });

    it("should throw BAD_REQUEST when trying to revoke the current session token", async () => {
      const mockSession = makeSessionMock(testUser, "current-token");
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);

      try {
        await revokeSession({ data: "current-token" });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as AppError).code).toBe("BAD_REQUEST");
        expect((error as AppError).message).toBe(
          "Cannot revoke your current session"
        );
      }
    });

    it("should throw UNAUTHORIZED when not logged in", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      try {
        await revokeSession({ data: "some-token" });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as AppError).code).toBe("UNAUTHORIZED");
      }
    });
  });
});
```

- [ ] **Step 2: Run the tests to verify they pass**

```bash
pnpm vitest run src/server/handlers/session-handlers.server.test.ts
```

Expected: all tests pass.

---

### Task 24: Rewrite `src/server/handlers/user-handlers.server.test.ts`

**Files:**
- Modify: `src/server/handlers/user-handlers.server.test.ts`

- [ ] **Step 1: Write tests for `updateUserFn` and `updateThemeFn`**

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "~/errors";
import { auth } from "~/lib/auth";
import { createTestUser, makeSessionMock } from "~/test/server-utils";
import type { TestUser } from "~/test/server-utils";

import { updateUserFn, updateThemeFn } from "./user-handlers";

vi.mock("@tanstack/react-start/server", () => ({
  getRequest: () => new Request("http://localhost:3000/"),
}));

vi.mock("~/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      updateUser: vi.fn(),
      changePassword: vi.fn(),
    },
  },
}));

vi.mock("~/server/services/user-services", () => ({
  updateUserTheme: vi.fn(),
}));

describe("User handlers", () => {
  let testUser: TestUser;

  beforeEach(async () => {
    testUser = await createTestUser();
    vi.clearAllMocks();
  });

  describe("updateUserFn", () => {
    it("should call updateUser and skip changePassword when no new password", async () => {
      const mockSession = makeSessionMock(testUser);
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
      vi.mocked(auth.api.updateUser).mockResolvedValue({} as any);

      await updateUserFn({
        data: {
          name: "New Name",
          email: "new@example.com",
          currentPassword: "",
          password: "",
          passwordConfirmation: "",
        },
      });

      expect(vi.mocked(auth.api.updateUser)).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { name: "New Name", email: "new@example.com" },
        })
      );
      expect(vi.mocked(auth.api.changePassword)).not.toHaveBeenCalled();
    });

    it("should call changePassword with revokeOtherSessions when password is provided", async () => {
      const mockSession = makeSessionMock(testUser);
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
      vi.mocked(auth.api.updateUser).mockResolvedValue({} as any);
      vi.mocked(auth.api.changePassword).mockResolvedValue({} as any);

      await updateUserFn({
        data: {
          name: "Name",
          email: "e@example.com",
          currentPassword: "oldpass123",
          password: "newpass123",
          passwordConfirmation: "newpass123",
        },
      });

      expect(vi.mocked(auth.api.changePassword)).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            currentPassword: "oldpass123",
            newPassword: "newpass123",
            revokeOtherSessions: true,
          },
        })
      );
    });

    it("should throw NOT_FOUND when not logged in", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      try {
        await updateUserFn({
          data: {
            name: "Name",
            email: "e@example.com",
            currentPassword: "",
            password: "",
            passwordConfirmation: "",
          },
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as AppError).code).toBe("NOT_FOUND");
      }
    });
  });

  describe("updateThemeFn", () => {
    it("should call updateUserTheme with the new theme", async () => {
      const mockSession = makeSessionMock(testUser);
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);

      const { updateUserTheme } = await import(
        "~/server/services/user-services"
      );

      await updateThemeFn({ data: { theme: "light" } });

      expect(vi.mocked(updateUserTheme)).toHaveBeenCalledWith(
        testUser.id,
        "light"
      );
    });
  });
});
```

- [ ] **Step 2: Run the tests**

```bash
pnpm vitest run src/server/handlers/user-handlers.server.test.ts
```

Expected: all tests pass.

---

### Task 25: Rewrite `src/server/services/user-services.server.test.ts`

**Files:**
- Modify: `src/server/services/user-services.server.test.ts`

- [ ] **Step 1: Keep only the `updateUserTheme` test**

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { faker } from "@faker-js/faker";

import { user as userTable } from "~/server/db/schema";
import { db } from "~/server/db";

import { updateUserTheme } from "./user-services";

describe("User services", () => {
  describe("updateUserTheme", () => {
    it("should update the user theme in the database", async () => {
      const [created] = await db
        .insert(userTable)
        .values({
          id: crypto.randomUUID(),
          name: faker.person.fullName(),
          email: faker.internet.email(),
          emailVerified: true,
          theme: "light",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      await updateUserTheme(created.id, "dark");

      const updated = await db.query.user.findFirst({
        where: eq(userTable.id, created.id),
      });

      if (!updated) throw new Error("updated should exist");
      expect(updated.theme).toBe("dark");
    });
  });
});
```

- [ ] **Step 2: Run the tests**

```bash
pnpm vitest run src/server/services/user-services.server.test.ts
```

Expected: 1 test passes.

---

### Task 26: Create `src/routes/api/test/create-user.tsx`

**Files:**
- Create: `src/routes/api/test/create-user.tsx`

This endpoint lets E2E tests create users without going through the UI (needed because E2E tests don't have direct DB access from the Playwright process).

- [ ] **Step 1: Create the test-only API endpoint**

```tsx
import { createAPIFileRoute } from "@tanstack/react-start/api";

import { auth } from "~/lib/auth";

export const APIRoute = createAPIFileRoute("/api/test/create-user")({
  POST: async ({ request }) => {
    if (process.env.NODE_ENV === "production") {
      return new Response("Not found", { status: 404 });
    }

    const { email, name, password } = (await request.json()) as {
      email: string;
      name: string;
      password: string;
    };

    await auth.api.signUpEmail({
      body: { email, name, password },
    });

    return new Response(JSON.stringify({ email, name }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
});
```

> This endpoint signs up a user bypassing the UI. Email verification is skipped because `DISABLE_EMAIL_VERIFICATION=true` in the test environment.

---

### Task 27: Update `src/test/e2e/truncateAll.ts`

**Files:**
- Modify: `src/test/e2e/truncateAll.ts`

- [ ] **Step 1: Update table names for better-auth schema**

```ts
import { account, session, todos, user, verification } from "~/server/db/schema";
import { db } from "~/server/db";

export async function truncateAll() {
  // Delete in order respecting FK constraints
  await db.delete(verification);
  await db.delete(session);
  await db.delete(todos);
  await db.delete(account);
  await db.delete(user);
}
```

---

### Task 28: Update `src/test/e2e/utils.ts`

**Files:**
- Modify: `src/test/e2e/utils.ts`

- [ ] **Step 1: Replace direct `createUser` call with test API endpoint**

```ts
import { test as base } from "@playwright/test";
import type { Page } from "@playwright/test";
import { locatorFixtures as fixtures } from "@playwright-testing-library/test/fixture.js";
import type { LocatorFixtures as TestingLibraryFixtures } from "@playwright-testing-library/test/fixture.js";
import type { Screen } from "@playwright-testing-library/test/dist/fixture/types";
import { waitFor } from "@playwright-testing-library/test";
import { faker } from "@faker-js/faker";

export const USER_TEST_PASSWORD = "foobar123";

export const test = base.extend<TestingLibraryFixtures>(fixtures);
export const { expect } = test;

async function createUserViaApi(
  email: string,
  name: string,
  password: string
): Promise<void> {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/test/create-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, password }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create test user: ${response.statusText}`);
  }
}

export async function createUserAndLogin(
  page: Page,
  screen: Screen,
  originalPage?: string
) {
  const password = USER_TEST_PASSWORD;
  const email = faker.internet.email({
    firstName: crypto.randomUUID().replaceAll("-", ""),
  });
  const name = faker.person.firstName();

  await createUserViaApi(email, name, password);

  await page.goto(originalPage || "/");
  await waitForLoadersToDisappear(screen);

  await screen.getByLabelText("Email").fill(email);
  await screen.getByLabelText("Password").fill(password);
  await screen.getByText("Sign in", { selector: "button" }).click();
  await waitFor(async () => {
    await expect(screen.getByTestId(`Welcome ${name}`)).toBeVisible();
  });

  return { email, name };
}

export async function waitForLoadersToDisappear(screen: Screen) {
  await waitFor(async () => {
    const loaders = await screen.findAllByTestId("loader");
    await expect(loaders).toHaveCount(0);
  });
}
```

---

### Task 29: Update `src/test/e2e/authentication.test.ts`

**Files:**
- Modify: `src/test/e2e/authentication.test.ts`

- [ ] **Step 1: Update signup test to NOT expect redirect to `/`**

With `DISABLE_EMAIL_VERIFICATION=true` in test env, better-auth skips email verification and the signup page redirects to `/verify-email`. But in E2E tests, we set `DISABLE_EMAIL_VERIFICATION=false` to test the real flow… actually wait: when disabled, `signUp` immediately logs in the user.

For E2E tests, since we set `DISABLE_EMAIL_VERIFICATION=true` in the test env server, signup should redirect to `/verify-email` (because we still show that page — the authClient `signUp.email` call succeeds and we navigate there). No wait — the signup page's `onSubmit` always navigates to `/verify-email` after a successful `authClient.signUp.email()`. The user IS created, email verification is skipped server-side, but the UI always shows the "check your inbox" page.

So the signup test should expect navigation to `/verify-email`, not `/`:

```ts
import { faker } from "@faker-js/faker";
import { waitFor } from "@playwright-testing-library/test";

import {
  createUserAndLogin,
  expect,
  test,
  waitForLoadersToDisappear,
} from "./utils";

test("signs up and lands on verify-email page", async ({ page, screen }) => {
  await page.goto("/signup");
  await waitForLoadersToDisappear(screen);

  await screen.getByLabelText("Email").fill(faker.internet.email());
  await screen.getByLabelText("Name").fill(faker.person.fullName());
  await screen.getByLabelText("Password").fill("foobar123");
  await screen.getByLabelText("Confirm password").fill("foobar123");
  await screen.getByText("Create account", { selector: "button" }).click();

  await page.waitForURL("/verify-email");
});

test("logins", async ({ page, screen }) => {
  await createUserAndLogin(page, screen);
});

test("shows login and then redirects to original page", async ({
  page,
  screen,
}) => {
  await createUserAndLogin(page, screen, "/profile");

  await page.waitForURL("/profile");
});

test("logs out and drops user on login page", async ({ page, screen }) => {
  const user = await createUserAndLogin(page, screen);

  await page.getByLabel("Account menu").click();
  await (await screen.findByText("Sign out")).click();

  await waitFor(async () => {
    expect(await (await screen.findByText("Sign in")).count()).toBe(1);
    expect(await screen.queryByText(user.name).count()).toBe(0);
  });
});
```

- [ ] **Step 2: Run all unit tests**

```bash
pnpm vitest run
```

Expected: all unit tests pass.

---

## Chunk 6: Final Verification

### Task 30: Full type check

- [ ] **Step 1: Run tsc**

```bash
pnpm tsc --noEmit
```

Expected: zero errors.

---

### Task 31: Run all unit tests

- [ ] **Step 1: Run vitest**

```bash
pnpm vitest run
```

Expected: all tests pass.

---

### Task 32: Run E2E tests

- [ ] **Step 1: Set env vars and start the app in test mode**

Ensure `.env` has:
```
DISABLE_EMAIL_VERIFICATION=true
NODE_ENV=test
```

- [ ] **Step 2: Run Playwright**

```bash
pnpm playwright test
```

Expected: all E2E tests pass. If any test fails, check that:
- The test server is running with `DISABLE_EMAIL_VERIFICATION=true`
- `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` are set
- `DATABASE_URL` points to the test database

---

### Task 33: Commit

- [ ] **Step 1: Stage and commit all changes**

```bash
git add -A
git commit -m "feat: replace custom auth with better-auth (email/password + email verification)"
```

---

## Appendix: Environment Variables Reference

| Variable | Required | Purpose |
|----------|----------|---------|
| `BETTER_AUTH_SECRET` | Yes | Session signing secret (32+ chars) |
| `BETTER_AUTH_URL` | Yes | App base URL (e.g. `http://localhost:3000`) |
| `RESEND_API_KEY` | Yes (prod) | Resend API key for sending emails |
| `DISABLE_EMAIL_VERIFICATION` | Test only | Set `"true"` to skip email verification |
| `DATABASE_URL` | Yes | PostgreSQL connection string |

## Appendix: Adding OAuth Providers Later

Adding GitHub login requires only two changes:

1. In `src/lib/auth.ts`, add `socialProviders`:
```ts
socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
},
```

2. Add a "Login with GitHub" button calling `authClient.signIn.social({ provider: "github" })`.

No schema changes needed — the `account` table already handles OAuth accounts.
