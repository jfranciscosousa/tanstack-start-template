# AGENTS.md

> Instructions for AI coding agents working on this TanStack Start template.

## Project Overview

Production-ready TanStack Start template with session-based authentication, PostgreSQL database, and modern React patterns. Features user management, profile pages with session tracking, and todo functionality.

**Key Technologies:** TanStack Start (v1.157) • React 19 • TypeScript 5 • Drizzle ORM • PostgreSQL • Tailwind v4 • DaisyUI • Vitest • Playwright

---

## Critical Rules (DO / DON'T)

### DO:
- ✅ Use **layered architecture**: Database layer (`db/`) → Service layer (`services/`) → Handler layer (`handlers/`)
- ✅ Use **absolute imports** with `~/` prefix (e.g., `import { db } from '~/server/db'`)
- ✅ Use **Zod validation** on all server functions with `.validator(schema)`
- ✅ Use **DaisyUI components** for UI (buttons, forms, cards, modals) - reference https://daisyui.com/components/
- ✅ Use **Lucide React** for icons - reference https://lucide.dev/icons/
- ✅ Use **Tailwind utilities** over custom CSS
- ✅ Hash passwords with **bcrypt-ts** before storing
- ✅ Use **Drizzle ORM** query builder (never raw SQL)
- ✅ Use **`createServerFn`** for all server-side operations
- ✅ Check files with **file-scoped commands** (see below) before committing

### DON'T:
- ❌ **Never** put database queries directly in handlers - use service layer
- ❌ **Never** put business logic in database layer - keep it in services
- ❌ **Never** expose sensitive data in error messages
- ❌ **Never** store plain-text passwords
- ❌ **Never** use type assertions when TanStack Router provides types
- ❌ **Never** create custom CSS classes unless absolutely necessary
- ❌ **Never** auto-generate migrations - review schema changes manually
- ❌ **Never** commit `.env` files or expose `SECRET_KEY_BASE`

---

## Architecture Quick Reference

### Layered Pattern (STRICT)
```
Database (db/) → Services (services/) → Handlers (handlers/) → Routes (routes/)
     ↓              ↓                      ↓                       ↓
  Schema only    Pure functions      Server functions        React components
```

**Example files to follow:**
- Service pattern: [src/server/services/userServices.ts](src/server/services/userServices.ts)
- Handler pattern: [src/server/handlers/sessionHandlers.ts](src/server/handlers/sessionHandlers.ts)
- Route pattern: [src/routes/_authed/profile.tsx](src/routes/_authed/profile.tsx)

### File Organization
- **Routes:** `src/routes/` (file-based routing with TanStack Router)
  - Protected routes: `_authed/*.tsx` (requires authentication)
  - Public routes: `login.tsx`, `signup.tsx`
- **Server:** `src/server/` (three-layer architecture)
  - `db/schema.ts`: Database schema (users, sessions, todos)
  - `services/`: Business logic (userServices, sessionService, passwordService, todoService)
  - `handlers/`: API endpoints (userHandlers, sessionHandlers, todoHandlers)
- **Components:** `src/components/` (reusable React components)
- **Hooks:** `src/hooks/` (custom React hooks)
- **Middleware:** `src/middlewares/` (request logging, etc.)

### Database Schema
Three tables: `users`, `sessions`, `todos` with Drizzle relations. See [src/server/db/schema.ts](src/server/db/schema.ts) for details.

---

## File-Scoped Commands

**Before making changes, validate individual files:**

```bash
# TypeScript check single file
bin/ts-check path/to/file.ts

# Lint single file
pnpm run eslint path/to/file.tsx

# Test single file
pnpm run vitest run path/to/test.test.ts

# Full project checks (use sparingly)
bin/test           # All tests
bin/ts-check       # Full type check
bin/lint           # All files
```

---

## Safety Boundaries

### ✅ Allowed (No Approval Needed)
- Reading any file
- Running file-scoped validation commands
- Writing/editing code files
- Running database queries via Drizzle

### ⚠️ Require Approval
- Installing/removing packages (`pnpm add/remove`)
- Git operations (`git commit`, `git push`)
- Database migrations (`drizzle-kit generate/migrate`)
- Deleting files
- Modifying `.env` or config files
- Running full builds in CI

---

## Development Workflow

### Starting Development
```bash
bin/setup          # First time setup (creates DB, runs migrations)
bin/dev            # Start dev server (http://localhost:3000)
```

### Database Changes
```bash
# 1. Edit src/server/db/schema.ts
# 2. Generate migration
pnpm run drizzle-kit generate
# 3. Review migration file (NEVER auto-apply)
# 4. Apply migration
pnpm run drizzle-kit migrate
# 5. Optional: Open Drizzle Studio
pnpm run drizzle-kit studio
```

### Testing Strategy
```bash
bin/test-vitest-watch     # Unit tests (watch mode)
bin/test-e2e              # E2E tests (Playwright)
bin/test                  # All tests
```

---

## Code Patterns

### Server Function Pattern (FOLLOW THIS)
```typescript
// ✅ GOOD - In handlers file
export const updateProfileServerFn = createServerFn({ method: "POST" })
  .validator(updateProfileSchema)  // Zod validation
  .handler(async ({ data, context }) => {
    const user = await getUserSession(context);
    if (!user) throw new AppError("Unauthenticated", "UNAUTHENTICATED");

    return await updateUser(user.id, data);  // Call service function
  });
```

```typescript
// ❌ BAD - Database query directly in handler
export const updateProfileServerFn = createServerFn({ method: "POST" })
  .handler(async ({ data, context }) => {
    // ❌ Don't query database directly
    await db.update(users).set(data).where(eq(users.id, context.user.id));
  });
```

### Component Pattern (FOLLOW THIS)
```typescript
// ✅ GOOD - DaisyUI components with Tailwind
import { Mail } from 'lucide-react';

export function ProfileCard() {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          <Mail className="w-5 h-5" />
          Email Settings
        </h2>
        <button className="btn btn-primary">Save</button>
      </div>
    </div>
  );
}
```

---

## Documentation References

**Primary Docs (check these first):**
- TanStack Start: https://tanstack.com/start/latest/docs
- TanStack Router: https://tanstack.com/router/latest/docs
- Drizzle ORM: https://orm.drizzle.team/docs
- DaisyUI Components: https://daisyui.com/components/
- Tailwind CSS: https://tailwindcss.com/docs

**When stuck:**
1. Check example files in codebase (patterns above)
2. Search relevant docs
3. Ask clarifying questions if approach is unclear

---

## PR Checklist

Before completing work:
- [ ] File-scoped type checks pass
- [ ] File-scoped linting passes
- [ ] Tests added/updated for new functionality
- [ ] No sensitive data exposed in errors
- [ ] Passwords are hashed with bcrypt-ts
- [ ] Follows layered architecture pattern
- [ ] Uses DaisyUI components for UI
- [ ] No custom CSS unless necessary

---

## Environment Variables

**Required:**
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY_BASE`: Session encryption key (32+ chars)

**Optional:**
- `NODE_ENV`: Environment mode (default: development)
- `PORT`: Server port (default: 3000)

**Never commit `.env` files** - use `.env.example` as template.

---

## When Uncertain

**Instead of making large speculative changes, ASK:**
- "Should this be a new service function or extend an existing one?"
- "Which architectural pattern should I follow for this feature?"
- "Do you want me to add tests before implementing?"

Progressive disclosure > large assumptions.

---

**Last Updated:** 2026-02-01
**Format:** AGENTS.md (https://agents.md)
