# AGENTS.md

> Agent-optimized documentation for AI coding assistants working with this codebase.
> Last updated: 2026-02-01

## Project Overview

A production-ready TanStack Start template featuring complete authentication functionality. This full-stack React application demonstrates modern web development patterns with session-based authentication, type-safe routing, and responsive design using contemporary React patterns and TypeScript.

**Key Capabilities:**
- Session-based authentication with encrypted HTTP-only cookies
- User profile management with active session tracking
- Todo CRUD operations with user isolation
- Responsive UI with dark mode support
- Comprehensive E2E and unit testing infrastructure
- Production-ready deployment configuration

---

## Technology Stack

### Core Framework & UI
- **[TanStack Start](https://tanstack.com/start/latest/docs)** (v1.157.18): Full-stack React framework with file-based routing and server functions
  - LLM docs: https://tanstack.com/start/latest/docs/framework/react/start/overview
- **[TanStack Router](https://tanstack.com/router/latest/docs)** (v1.157.18): Type-safe routing with nested layouts and automatic code splitting
  - LLM docs: https://tanstack.com/router/latest/docs/framework/react/overview
- **[React](https://react.dev)** (v19.2.4): Latest React with concurrent features and modern patterns
  - LLM docs: https://react.dev/reference/react
- **[TypeScript](https://www.typescriptlang.org/docs/)** (v5.9.3): Strict type checking with ES2022 target

### Database & ORM
- **[Drizzle ORM](https://orm.drizzle.team/docs/overview)** (v0.45.1): Type-safe PostgreSQL ORM with migrations
  - LLM docs: https://orm.drizzle.team/docs/get-started
  - Kit version: v0.31.8
- **[Postgres](https://node-postgres.com/)** (v3.4.8): PostgreSQL client for Node.js

### Styling & Design
- **[Tailwind CSS](https://tailwindcss.com/docs)** (v4.1.18): Utility-first CSS framework
  - LLM docs: https://tailwindcss.com/docs/installation
  - Uses CSS-first configuration (v4 approach, no separate config file)
- **[DaisyUI](https://daisyui.com/)** (v5.5.16): Component library built on Tailwind
  - Docs: https://daisyui.com/docs/
  - LLM-friendly component reference: https://daisyui.com/components/
- **[Lucide React](https://lucide.dev/)** (v0.563.0): Icon library
  - Docs: https://lucide.dev/guide/packages/lucide-react

### Build Tools & Development
- **[Vite](https://vite.dev/)** (v7.3.1): Fast build tooling with HMR and optimized bundling
  - LLM docs: https://vite.dev/guide/
- **[pnpm](https://pnpm.io/)**: Fast, disk space efficient package manager
  - Docs: https://pnpm.io/motivation

### Testing
- **[Vitest](https://vitest.dev/)** (v4.0.18): Fast unit testing with React Testing Library
  - LLM docs: https://vitest.dev/guide/
- **[Playwright](https://playwright.dev/)** (v1.58.1): End-to-end testing framework
  - LLM docs: https://playwright.dev/docs/intro
  - Using @playwright/test with testing-library integration

### Security & Validation
- **[bcrypt-ts](https://github.com/Savatar/bcrypt-ts)** (v8.0.1): Secure password hashing
- **[Zod](https://zod.dev/)** (v4.3.6): Schema validation for forms and API inputs
  - LLM docs: https://zod.dev/?id=basic-usage

### Additional Libraries
- **[Sonner](https://sonner.emilkowal.ski/)** (v2.0.7): Toast notifications
- **[@faker-js/faker](https://fakerjs.dev/)** (v10.2.0): Data generation for testing

---

## Development Commands

### Core Development
```bash
bin/dev            # Start development server (http://localhost:3000)
bin/build          # Build for production
bin/build-prod     # Production build variant
bin/start          # Start production server
bin/setup          # Initial project setup with database configuration
bin/clean          # Clean build artifacts
```

### Database Management
```bash
bin/db                      # Database management wrapper
npx drizzle-kit generate    # Generate migration files after schema changes
npx drizzle-kit migrate     # Apply pending migrations
npx drizzle-kit push        # Push schema changes directly without migration
npx drizzle-kit studio      # Open Drizzle Studio database browser UI
```

### Testing
```bash
bin/test                # Run all tests (unit + e2e)
bin/test-vitest         # Run unit tests with Vitest
bin/test-vitest-watch   # Run unit tests in watch mode
bin/test-e2e            # End-to-end tests with Playwright
bin/test-e2e-ui         # E2E UI mode (interactive debugging)
bin/test-e2e-setup      # E2E setup and configuration
```

### Code Quality
```bash
bin/lint           # Run ESLint
bin/lint-fix       # Fix linting issues automatically
bin/ts-check       # Run TypeScript compiler check
bin/ts-watch       # TypeScript watch mode
pnpm format        # Format code with Prettier
```

### Utilities
```bash
bin/help           # Show help information
bin/load-env       # Environment variable loading
bin/validate-env   # Environment validation
bin/ci             # CI pipeline script
bin/deploy         # Deployment script
```

---

## Architecture

### File-based Routing Structure

**Location:** `src/routes/`
**Convention:** TanStack Router file-based routing with automatic type safety

#### Root & Layout Routes
- [\_\_root.tsx](src/routes/__root.tsx): Root layout with user context, navigation, global providers (Sonner toasts), and error boundaries
- [\_authed.tsx](src/routes/_authed.tsx): Protected route layout requiring authentication (auto-redirects to `/login`)

#### Public Routes
- [login.tsx](src/routes/login.tsx): Login page with form validation and error handling
- [signup.tsx](src/routes/signup.tsx): User registration page with validation and auto-login

#### Protected Routes (require authentication)
- [\_authed/index.tsx](src/routes/_authed/index.tsx): Dashboard/home page for authenticated users
- [\_authed/profile.tsx](src/routes/_authed/profile.tsx): Profile page container with tab navigation
- [\_authed/profile/-ProfileTab.tsx](src/routes/_authed/profile/-ProfileTab.tsx): User profile information tab
- [\_authed/profile/-SessionsTab.tsx](src/routes/_authed/profile/-SessionsTab.tsx): Active sessions management tab
- [logout.tsx](src/routes/logout.tsx): Logout functionality with session cleanup

**Route Protection Pattern:**
```typescript
// _authed.tsx uses beforeLoad to enforce authentication
beforeLoad: async ({ context }) => {
  if (!context.user) {
    throw redirect({ to: '/login', search: { redirect: location.href } })
  }
}
```

### Middleware System

**Location:** `src/middlewares/`
**Registration:** Via `requestMiddleware` array in [src/start.ts](src/start.ts)

- [logging.ts](src/middlewares/logging.ts): Request logging middleware with duration tracking
  - Logs HTTP method, endpoint/server function name, status code, and request duration (ms)
  - Decodes Base64-encoded server function names for readable logs
  - Uses ANSI color codes (yellow for success, red for errors)

**Example log output:**
```
http POST loginServerFn 200 45.32ms
http GET /api/todos 200 12.15ms
http GET /_authed/profile ERROR 123.45ms
```

### Authentication System

**Session Management:**
- Uses TanStack Start's `useSession` hook with encrypted HTTP-only cookies
- Session data stored in PostgreSQL with user association
- Tracks IP address, user agent, and location for security

**Password Security:**
- bcrypt-ts for secure password hashing with salt rounds
- Passwords never stored in plain text
- Hash verification on login

**Server Functions:**
- Type-safe server-side operations using `createServerFn` from TanStack Start
- All authentication logic runs server-side only
- Automatic CSRF protection through TanStack Start's session handling

**Route Protection:**
- `_authed` layout automatically redirects unauthenticated users to `/login`
- Return URL preserved in query params for post-login redirect
- Session validation on every protected route access

**Session Persistence:**
- Secure sessions survive browser restarts
- Session cleanup on logout
- Multiple concurrent sessions supported (viewable in profile)

### Server Architecture

**Location:** `src/server/`
**Pattern:** Three-layer architecture (Database → Service → Handler)

#### Database Layer (`src/server/db/`)
- [db/index.ts](src/server/db/index.ts): Drizzle database client configuration with connection pooling and schema imports
- [db/schema.ts](src/server/db/schema.ts): PostgreSQL schema definitions with relations and type exports

**Schema Tables:**
1. `users`: User accounts (id, name, email, password, createdAt, updatedAt)
2. `sessions`: User sessions with metadata (id, userId, ipAddress, userAgent, location, createdAt, updatedAt) - indexed on userId
3. `todos`: User todos (id, userId, content, createdAt) - indexed on userId

**Type Exports:**
```typescript
export type User = typeof users.$inferSelect;
export type UserWithoutPassword = Omit<User, "password">;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
```

#### Service Layer (`src/server/services/`)
Business logic and data operations - pure functions that interact with the database.

- [userServices.ts](src/server/services/userServices.ts): User management (create, update, fetch by email/session)
- [sessionService.ts](src/server/services/sessionService.ts): Session CRUD, verification, and cleanup
- [passwordService.ts](src/server/services/passwordService.ts): Password hashing and verification utilities
- [todoService.ts](src/server/services/todoService.ts): Todo CRUD operations with user isolation

**Service Pattern:**
```typescript
// Services are pure data operations
export async function getUserByEmail(email: string): Promise<User | undefined> {
  return await db.query.users.findFirst({ where: eq(users.email, email) });
}
```

#### Handler Layer (`src/server/handlers/`)
API endpoints and request/response handling - uses services to fulfill requests.

- [sessionHandlers.ts](src/server/handlers/sessionHandlers.ts): Authentication endpoints (login, session fetch, logout)
- [userHandlers.ts](src/server/handlers/userHandlers.ts): User endpoints (registration, profile updates)
- [todoHandlers.ts](src/server/handlers/todoHandlers.ts): Todo API endpoints with Zod validation

**Handler Pattern:**
```typescript
// Handlers use createServerFn and call services
export const loginServerFn = createServerFn({ method: "POST" })
  .validator(loginSchema)
  .handler(async ({ data, context }) => {
    const user = await getUserByEmail(data.email);
    // ... validation and session creation
  });
```

#### Utilities (`src/server/`)
- [websession.ts](src/server/websession.ts): Session utilities, user context management, and session validation
- [request-info.ts](src/server/request-info.ts): Request metadata extraction (IP, user agent, location)
- [seo.ts](src/server/seo.ts): SEO and meta tag utilities

### Database Schema (Drizzle)

**Location:** [src/server/db/schema.ts](src/server/db/schema.ts)

Current schema optimized for authentication with three tables, including relations and performance indexes:

```typescript
// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),  // bcrypt hashed with salt
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Sessions table with indexes for performance
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, table => [
  index("sessions_user_id_idx").on(table.userId)  // Performance index
]);

// Todos table with indexes for performance
export const todos = pgTable("todos", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, table => [
  index("todos_user_id_idx").on(table.userId)  // Performance index
]);

// Drizzle relations for type-safe joins and queries
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  todos: many(todos),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(users, { fields: [todos.userId], references: [users.id] }),
}));
```

**Key Features:**
- All tables use UUID primary keys with `defaultRandom()`
- Automatic timestamps with `$onUpdate` for `updatedAt`
- Cascade delete: deleting a user removes all sessions and todos
- Indexes on foreign keys for query performance
- Type-safe relations for joins using Drizzle's relations API

### Error Handling & Validation

**Custom Error Class:** [src/errors.ts](src/errors.ts)

```typescript
export class AppError extends Error {
  code: ErrorCode;
  statusCode: number;
}
```

**Error Codes:**
- `NOT_FOUND` (404)
- `UNPROCESSABLE_ENTITY` (422)
- `UNAUTHORIZED` (401)
- `UNAUTHENTICATED` (401)
- `FORBIDDEN` (403)
- `BAD_REQUEST` (400)
- `INTERNAL_SERVER_ERROR` (500)

**Validation Strategy:**
- **Form Validation**: Zod schemas for type-safe form validation
- **Server Validation**: Server-side validation for all user inputs using Zod
- **Error Boundaries**: React error boundaries via `DefaultCatchBoundary` component
- **User Feedback**: Consistent error messaging with Sonner toast notifications

**Validation Pattern:**
```typescript
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginServerFn = createServerFn({ method: "POST" })
  .validator(loginSchema)  // Automatic validation
  .handler(async ({ data }) => { /* validated data */ });
```

---

## Component Structure

### Core Components (`src/components/`)

- [Navbar.tsx](src/components/Navbar.tsx): Responsive navigation with user context and logout functionality
- [Avatar.tsx](src/components/Avatar.tsx): User avatar component with initials fallback
- [PasswordInput.tsx](src/components/PasswordInput.tsx): Password input with show/hide toggle
- [TextInput.tsx](src/components/TextInput.tsx): Reusable text input component with validation states
- [DefaultCatchBoundary.tsx](src/components/DefaultCatchBoundary.tsx): Error boundary component for route-level errors
- [NotFound.tsx](src/components/NotFound.tsx): Custom 404 page with navigation options

### Custom Hooks (`src/hooks/`)

- [useMutation.ts](src/hooks/useMutation.ts): Custom mutation hook for server functions
- [useFormDataValidator.ts](src/hooks/useFormDataValidator.ts): Form data validation hook with Zod integration

### Authentication Flow

1. **Route Access**: User visits protected route → automatic redirect to `/login` with return URL in query params
2. **Login Process**: Form validation (client + server) → password verification → session creation → redirect to original destination
3. **Registration**: Form validation → user creation → password hashing → auto-login → session creation → redirect to dashboard
4. **Logout**: Session deletion → cookie removal → redirect to login page
5. **Session Validation**: Automatic session checking on protected routes via `beforeLoad` hook

**Flow Diagram:**
```
┌─────────────┐
│ Visit /app  │
└──────┬──────┘
       │ Not authenticated
       ▼
┌─────────────┐     ┌──────────────┐
│ /login      │────▶│ Submit form  │
└─────────────┘     └──────┬───────┘
                           │ Valid credentials
                           ▼
                    ┌──────────────┐
                    │Create session│
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │Redirect /app │
                    └──────────────┘
```

---

## Configuration Files

### Core Config
- [vite.config.ts](vite.config.ts): TanStack Start plugin, TypeScript paths, Tailwind, type checking, Nitro v2 preset for Vercel
- [tsconfig.json](tsconfig.json): Strict TypeScript with path mapping (`~/src/*`), ES2022 target, React JSX runtime
- [drizzle.config.ts](drizzle.config.ts): Drizzle Kit configuration pointing to `src/server/db/schema.ts` with PostgreSQL dialect
- **Tailwind v4**: Uses CSS-first configuration (no separate `tailwind.config.ts`), configured in CSS files

### Package Configuration
- [package.json](package.json): Dependencies, scripts, and project metadata
- `.env`: Environment variables (excluded from git, use `.env.example` as template)
- [.gitignore](.gitignore): Git exclusions including env files and build artifacts

---

## Environment Variables

### Required Variables
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"  # PostgreSQL connection string
SECRET_KEY_BASE="your-secret-key-here-min-32-chars"          # Session encryption (32+ characters)
```

### Optional Variables
```bash
NODE_ENV="development"                     # Environment mode (development|production|test)
PORT="3000"                               # Server port (default: 3000)
```

**Important Notes:**
- Never commit `.env` to git
- `SECRET_KEY_BASE` must be at least 32 characters for secure session encryption
- Use different `DATABASE_URL` for development, testing, and production
- Generate strong random strings for `SECRET_KEY_BASE` in production

---

## Styling Guidelines

### Design System

**Framework:** Tailwind CSS v4.1.18 (CSS-first configuration)
- Docs: https://tailwindcss.com/docs
- V4 migration guide: https://tailwindcss.com/docs/v4-beta

**Component Library:** DaisyUI v5.5.16
- Components: https://daisyui.com/components/
- Customization: https://daisyui.com/docs/customize/

**Icons:** Lucide React v0.563.0
- Browse icons: https://lucide.dev/icons/

**Theme:**
- Default DaisyUI theme with dark mode support
- Dark mode toggle available via DaisyUI theme controller
- Responsive design with mobile-first approach

### Component Patterns

**DO:**
- Use DaisyUI components for forms, buttons, cards, navigation, modals
- Prefer Tailwind utilities over custom CSS
- Maintain consistent spacing using Tailwind's spacing scale (4, 8, 12, 16, etc.)
- Use semantic color classes (`btn-primary`, `btn-secondary`, `btn-accent`, `btn-neutral`)
- Use Lucide React icons with consistent sizing
- Implement responsive design with `sm:`, `md:`, `lg:` breakpoints

**DON'T:**
- Create custom CSS classes unless absolutely necessary
- Mix custom CSS with Tailwind utilities inconsistently
- Use inline styles instead of Tailwind classes
- Hardcode color values (use DaisyUI theme colors)

**Example Pattern:**
```tsx
import { Mail } from 'lucide-react';

export function ExampleComponent() {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          <Mail className="w-5 h-5" />
          Email Settings
        </h2>
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  );
}
```

---

## Development Best Practices

### Code Organization

**Imports:**
- Use absolute imports with `~/` prefix for src directory
- Example: `import { db } from '~/server/db'`
- Configured in `tsconfig.json` paths and Vite config

**Types:**
- Define TypeScript interfaces in component files for component-specific types
- Use Drizzle-inferred types from schema for database entities
- Export shared types from appropriate service/handler files

**Server Architecture Layers:**
1. **Database Layer** (`src/server/db/`): Schema definitions and database client - NO business logic
2. **Service Layer** (`src/server/services/`): Business logic and data operations - pure functions
3. **Handler Layer** (`src/server/handlers/`): API endpoints and request/response handling - uses services
4. **Utilities** (`src/server/`): Session management, request info, and shared utilities

**File Naming:**
- Components: PascalCase (`Navbar.tsx`, `TextInput.tsx`)
- Hooks: camelCase with 'use' prefix (`useMutation.ts`)
- Services: camelCase with 'Service' suffix (`userServices.ts`)
- Handlers: camelCase with 'Handlers' suffix (`sessionHandlers.ts`)
- Routes: kebab-case or TanStack Router conventions (`_authed.tsx`, `login.tsx`)

### Security Practices

**Input Validation:**
- Validate ALL user inputs with Zod schemas
- Validate on both client and server (client for UX, server for security)
- Never trust client-side validation alone

**Password Security:**
- Use bcrypt-ts with appropriate salt rounds (default: 10)
- Never log or expose passwords
- Always hash passwords before storing

**Session Security:**
- HTTP-only cookies to prevent XSS
- Secure flag in production (HTTPS only)
- SameSite cookie attribute for CSRF protection
- Session expiration and cleanup

**Error Handling:**
- Never expose sensitive information in error messages
- Use generic error messages for authentication failures
- Log detailed errors server-side only
- Sanitize error messages before sending to client

**SQL Injection Prevention:**
- Use Drizzle ORM's query builder (parameterized queries)
- Never concatenate user input into SQL strings
- Use Zod validation before database queries

### Performance Considerations

**Code Splitting:**
- Automatic route-based code splitting with TanStack Router
- Lazy load heavy components with `React.lazy()`
- Use dynamic imports for large dependencies

**Database:**
- Use Drizzle's query optimization features
- Add indexes on frequently queried columns (already implemented for userId)
- Use prepared statements for repeated queries
- Implement pagination for large datasets

**Caching:**
- Leverage TanStack Start's built-in caching
- Use React Server Components for static content
- Consider adding HTTP caching headers for static assets

**Bundle Size:**
- Monitor bundle size with `pnpm build` output
- Use tree-shaking friendly imports (e.g., `import { Button } from 'lucide-react'`)
- Analyze bundle with Vite's rollup visualization

### Testing Strategy

**Unit Tests (Vitest):**
- Test business logic in services layer
- Test utility functions
- Test React components with React Testing Library
- Mock database calls in service tests

**E2E Tests (Playwright):**
- Test critical user flows (auth, profile, todos)
- Test across different browsers (Chromium, Firefox, WebKit)
- Use Playwright Testing Library for better selectors

**Test Organization:**
- Co-locate tests with source files or use `__tests__` directories
- Use descriptive test names: `it('should create user session on successful login')`
- Follow AAA pattern: Arrange, Act, Assert

---

## Deployment Considerations

### Production Setup

**Environment Variables:**
```bash
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@prod-host:5432/dbname"
SECRET_KEY_BASE="strong-random-secret-min-32-chars"
```

**Database Migration:**
```bash
npx drizzle-kit migrate  # Apply pending migrations
```

**Build & Start:**
```bash
pnpm build
pnpm start
```

**Security Checklist:**
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `DATABASE_URL` for production database
- [ ] Generate strong `SECRET_KEY_BASE` (32+ characters)
- [ ] Enable HTTPS for secure cookies
- [ ] Set up database migrations pipeline
- [ ] Configure CORS if needed
- [ ] Set up rate limiting
- [ ] Configure CSP headers
- [ ] Enable security headers (Helmet or similar)

### Environment-Specific Notes

**Development:**
- Uses PostgreSQL with connection pooling
- Hot module replacement (HMR) enabled
- Detailed error messages
- Source maps enabled

**Production:**
- Uses PostgreSQL with optimized connection settings
- Minified bundles
- Generic error messages
- No source maps (or separate source map files)
- Enable security headers

**Testing:**
- Configure separate test database
- Reset database between test runs
- Use in-memory database for faster tests (optional)
- Mock external services

### Deployment Targets

**Vercel (Recommended):**
- Pre-configured with Nitro v2 preset in `vite.config.ts`
- Automatic deployments from git
- Environment variables managed in Vercel dashboard
- PostgreSQL via Vercel Postgres or external provider

**Docker:**
- Create `Dockerfile` for containerization
- Use multi-stage builds for smaller images
- Set environment variables via Docker secrets or env files

**Other Platforms:**
- Adapt Nitro preset in `vite.config.ts` as needed
- Ensure Node.js version compatibility (v18+)
- Configure process manager (PM2, systemd, etc.)

---

## Common Patterns & Anti-Patterns

### ✅ DO: Server Function Pattern
```typescript
// handlers/userHandlers.ts
export const updateProfileServerFn = createServerFn({ method: "POST" })
  .validator(updateProfileSchema)
  .handler(async ({ data, context }) => {
    const user = await getUserSession(context);
    if (!user) throw new AppError("Unauthenticated", "UNAUTHENTICATED");

    return await updateUser(user.id, data);
  });
```

### ❌ DON'T: Business Logic in Handlers
```typescript
// BAD: Don't put database queries directly in handlers
export const updateProfileServerFn = createServerFn({ method: "POST" })
  .validator(updateProfileSchema)
  .handler(async ({ data, context }) => {
    // ❌ Don't query database directly
    await db.update(users).set(data).where(eq(users.id, context.user.id));
  });
```

### ✅ DO: Type-Safe Route Parameters
```typescript
// routes/_authed/profile.tsx
export const Route = createFileRoute('/_authed/profile')({
  validateSearch: z.object({
    tab: z.enum(['profile', 'sessions']).optional(),
  }),
});
```

### ❌ DON'T: Manual Type Assertions
```typescript
// BAD: Don't use type assertions when TanStack Router provides types
const searchParams = new URLSearchParams(window.location.search);
const tab = searchParams.get('tab') as 'profile' | 'sessions'; // ❌
```

### ✅ DO: Proper Error Handling
```typescript
try {
  await loginServerFn({ email, password });
} catch (error) {
  if (error instanceof AppError) {
    toast.error(error.message);
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

### ❌ DON'T: Expose Internal Errors
```typescript
// BAD: Don't expose internal error details to users
catch (error) {
  toast.error(error.stack); // ❌ Exposes sensitive information
}
```

---

## Agent-Specific Guidelines

### When Making Changes

1. **Read First**: Always read files before modifying them
2. **Preserve Patterns**: Follow existing architecture patterns (layered architecture)
3. **Type Safety**: Maintain TypeScript type safety throughout
4. **Test Coverage**: Add tests for new features
5. **Documentation**: Update AGENTS.md if adding new patterns or technologies

### File References

When referencing code, use the format `[filename](path)` or `[filename:line](path#Lline)`:
- "Update the login handler in [sessionHandlers.ts](src/server/handlers/sessionHandlers.ts)"
- "Check the validation schema at [sessionHandlers.ts:15](src/server/handlers/sessionHandlers.ts#L15)"

### Common Tasks

**Adding a New Route:**
1. Create file in `src/routes/` following TanStack Router conventions
2. Add to protected routes? Create under `_authed/`
3. Update route tree: TanStack Router generates automatically
4. Add navigation link in [Navbar.tsx](src/components/Navbar.tsx) if needed

**Adding a New Database Table:**
1. Define schema in [src/server/db/schema.ts](src/server/db/schema.ts)
2. Add relations if needed
3. Export types
4. Run `npx drizzle-kit generate` to create migration
5. Run `npx drizzle-kit migrate` to apply migration
6. Create service functions in `src/server/services/`
7. Create handlers in `src/server/handlers/`

**Adding a New Server Function:**
1. Create handler in appropriate file in `src/server/handlers/`
2. Define Zod validation schema
3. Use `createServerFn` with validator
4. Call service functions for business logic
5. Handle errors with `AppError`
6. Export for use in components

**Adding a New Component:**
1. Create in `src/components/`
2. Use TypeScript for props
3. Use Tailwind + DaisyUI for styling
4. Add to existing route or create new route
5. Consider reusability and composition

---

## Troubleshooting

### Common Issues

**Build Errors:**
- Run `bin/ts-check` to check TypeScript errors
- Check `vite.config.ts` for plugin configurations
- Clear `.vinxi` directory and rebuild

**Database Connection:**
- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL is running
- Test connection with `psql` or database client

**Session Issues:**
- Verify `SECRET_KEY_BASE` is set and 32+ characters
- Check browser cookies are enabled
- Clear browser cookies and retry

**Type Errors:**
- Run `pnpm install` to ensure dependencies are up to date
- Check `tsconfig.json` paths configuration
- Regenerate route tree with dev server

---

## Resources

### Official Documentation
- [TanStack Start](https://tanstack.com/start/latest/docs)
- [TanStack Router](https://tanstack.com/router/latest/docs)
- [React](https://react.dev)
- [Drizzle ORM](https://orm.drizzle.team/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [DaisyUI](https://daisyui.com/docs/)
- [Vite](https://vite.dev)
- [Vitest](https://vitest.dev)
- [Playwright](https://playwright.dev)

### Community Resources
- [TanStack Discord](https://discord.com/invite/tanstack)
- [Drizzle Discord](https://discord.gg/drizzle)
- [TypeScript Discord](https://discord.com/invite/typescript)

---

**Last Updated:** 2026-02-01
**Template Version:** 1.0.0
**Maintained By:** Project maintainers
