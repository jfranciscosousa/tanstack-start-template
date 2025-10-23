# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A production-ready TanStack Start template featuring complete authentication functionality. This full-stack React application demonstrates modern web development patterns with session-based authentication, type-safe routing, and responsive design using contemporary React patterns and TypeScript.

## Technology Stack

- **TanStack Start**: Full-stack React framework with file-based routing and server functions
- **TanStack Router**: Type-safe routing with nested layouts and automatic code splitting
- **React 19.2.0** with **TypeScript 5.x**: Latest React with concurrent features
- **Drizzle ORM 0.44.6** with PostgreSQL database
- **Tailwind CSS 4.1.14** + **DaisyUI 5.3.2**: Utility-first CSS with component library
- **Vite 7.1.10**: Fast build tooling with HMR and optimized bundling
- **Vitest 3.2.4**: Fast unit testing with React Testing Library
- **pnpm**: Fast, disk space efficient package manager
- **bcrypt-ts**: Secure password hashing
- **Zod**: Schema validation for forms and API inputs

## Development Commands

### Core Development
```bash
bin/dev            # Start development server (http://localhost:3000)
bin/build          # Build for production
bin/start          # Start production server
bin/setup          # Initial project setup
```

### Database Management
```bash
npx drizzle-kit generate    # Generate migration files after schema changes
npx drizzle-kit migrate     # Apply pending migrations
npx drizzle-kit push        # Push schema changes directly without migration
npx drizzle-kit studio      # Open Drizzle Studio database browser UI
```

### Testing
```bash
bin/test           # Run all tests (unit + e2e)
bin/test-vitest    # Run unit tests with Vitest
bin/test-vitest-watch  # Run unit tests in watch mode
```

### Code Quality
```bash
bin/lint           # Run ESLint
bin/ts-check       # Run TypeScript compiler check
pnpm format        # Format code with Prettier
```

## Architecture

### File-based Routing Structure
Routes in `src/routes/` follow TanStack Router conventions with automatic type safety:
- `__root.tsx`: Root layout with user context, navigation, global providers, and error boundaries
- `_authed.tsx`: Protected route layout requiring authentication (auto-redirects to login)
- `_authed/index.tsx`: Protected dashboard/home page for authenticated users
- `login.tsx`: Login page with form validation and error handling
- `signup.tsx`: User registration page with validation and auto-login
- `logout.tsx`: Logout functionality with session cleanup

### Authentication System
- **Session Management**: TanStack Start's `useSession` with encrypted HTTP-only cookies
- **Password Security**: bcrypt-ts for secure password hashing with salt rounds
- **Server Functions**: Type-safe server-side operations using `createServerFn`
- **Route Protection**: `_authed` layout automatically redirects unauthenticated users
- **Session Persistence**: Secure sessions survive browser restarts
- **CSRF Protection**: Built-in protection through TanStack Start's session handling

### Server Architecture (src/server/)
The server code has been refactored into a layered architecture pattern:

#### Database Layer (`db/`)
- `db/index.ts`: Drizzle database client configuration with connection pooling and schema imports
- `db/schema.ts`: Drizzle schema definitions with relations and type exports

#### Service Layer (`services/`)
- `userServices.ts`: User management operations (create, update, fetch by email/session)
- `sessionService.ts`: Session management (create, fetch, verify, delete sessions)
- `passwordService.ts`: Password hashing and verification utilities using bcrypt-ts
- `todoService.ts`: Todo CRUD operations and user-specific todo management

#### Handler Layer (`handlers/`)
- `sessionHandlers.ts`: Authentication endpoints (login, session management, logout)
- `userHandlers.ts`: User endpoints (registration, profile updates)
- `todoHandlers.ts`: Todo API endpoints with validation

#### Utilities
- `websession.ts`: Session utilities, user context management, and session validation
- `request-info.ts`: Request metadata extraction for session tracking
- `seo.ts`: SEO and meta tag utilities

### Database Schema (Drizzle)
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
  index("sessions_user_id_idx").on(table.userId)
]);

// Todos table with indexes for performance
export const todos = pgTable("todos", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, table => [
  index("todos_user_id_idx").on(table.userId)
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

// Exported types for TypeScript
export type User = typeof users.$inferSelect;
export type UserWithoutPassword = Omit<User, "password">;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
```

### Error Handling & Validation
- **Custom Errors**: `AppError` class in `src/errors.ts` with standardized error codes
- **Form Validation**: Zod schemas for type-safe form validation
- **Error Boundaries**: React error boundaries for graceful error handling
- **User Feedback**: Consistent error messaging across authentication flows
- **Server Validation**: Server-side validation for all user inputs

## Component Structure

### Core Components (src/components/)
- `Navbar.tsx`: Responsive navigation with user context and logout functionality
- `SignUp.tsx`: Registration form with real-time validation and error states
- `DefaultCatchBoundary.tsx`: Error boundary component for route-level errors
- `NotFound.tsx`: Custom 404 page with navigation options

### Authentication Flow
1. **Route Access**: User visits protected route → automatic redirect to `/login` with return URL
2. **Login Process**: Form validation → server authentication → session creation → redirect back
3. **Registration**: New user creation → password hashing → auto-login → dashboard redirect
4. **Logout**: Session cleanup → cookie removal → redirect to login page
5. **Session Validation**: Automatic session checking on protected routes

## Configuration Files

### Core Config
- **vite.config.ts**: TanStack Start plugin + TypeScript paths + Tailwind + type checking
- **tsconfig.json**: Strict TypeScript with path mapping (`~/src/*`) and modern target
- **drizzle.config.ts**: Drizzle Kit configuration for migrations and schema management
- **src/server/db/schema.ts**: Database schema with PostgreSQL
- **tailwind.config.ts**: Tailwind configuration with DaisyUI plugin and custom theme

### Package Configuration
- **package.json**: Dependencies, scripts, and project metadata
- **.env**: Environment variables (excluded from git)
- **.gitignore**: Git exclusions including env files and build artifacts

## Environment Variables

### Required Variables
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"  # PostgreSQL connection string
SECRET_KEY_BASE="your-secret-key"                            # Session encryption (32+ chars)
```

### Optional Variables
```bash
NODE_ENV="development"                     # Environment mode
PORT="3000"                               # Server port
```

## Styling Guidelines

### Design System
- **Framework**: Tailwind CSS 4.1.14 for utility-first styling
- **Components**: DaisyUI 5.3.2 for pre-built, accessible components
- **Documentation**: https://daisyui.com/docs/v5/
- **Theme**: Default DaisyUI theme with dark mode support
- **Responsive**: Mobile-first approach with responsive breakpoints

### Component Patterns
- Use DaisyUI components for forms, buttons, cards, and navigation
- Prefer Tailwind utilities over custom CSS
- Maintain consistent spacing using Tailwind's spacing scale
- Use semantic color classes (primary, secondary, accent, neutral)

## Development Best Practices

### Code Organization
- **Imports**: Use absolute imports with `~/` prefix for src directory
- **Types**: Define TypeScript interfaces in component files or shared types directory
- **Server Architecture**: Follows layered architecture pattern:
  - **Database Layer** (`src/server/db/`): Schema definitions and database client
  - **Service Layer** (`src/server/services/`): Business logic and data operations
  - **Handler Layer** (`src/server/handlers/`): API endpoints and request/response handling
  - **Utilities** (`src/server/`): Session management, request info, and shared utilities
- **Components**: Reusable components in `src/components/`
- **Routes**: File-based routing in `src/routes/` with layouts and protected routes

### Security Practices
- **Input Validation**: Validate all user inputs with Zod schemas
- **Password Security**: Use bcrypt with appropriate salt rounds
- **Session Security**: HTTP-only cookies with secure flags in production
- **Error Handling**: Never expose sensitive information in error messages

### Performance Considerations
- **Code Splitting**: Automatic with TanStack Router
- **Database**: Use Drizzle's query optimization features and prepared statements
- **Caching**: Leverage TanStack Start's built-in caching
- **Bundle Size**: Monitor bundle size with Vite's analysis tools

## Deployment Considerations

### Production Setup
- Set `NODE_ENV=production`
- Configure proper `DATABASE_URL` for PostgreSQL
- Configure proper `SECRET_KEY_BASE`
- Enable HTTPS for secure cookies
- Set up database migrations pipeline with `drizzle-kit migrate`

### Environment-Specific Notes
- **Development**: Uses PostgreSQL with connection pooling
- **Production**: Uses PostgreSQL with optimized connection settings
- **Testing**: Configure separate test database