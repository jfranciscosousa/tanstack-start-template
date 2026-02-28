# TanStack Start Template

A modern full-stack React application built with TanStack Start, featuring complete authentication functionality and a clean, responsive design.

## Features

- 🔐 **Complete Authentication System** - User registration, login, logout with session management
- 🛡️ **Route Protection** - Automatic redirects for protected routes
- 🎨 **Modern UI** - Tailwind CSS + DaisyUI component library
- 📱 **Responsive Design** - Mobile-first approach with clean navigation
- 🗄️ **Database Integration** - Drizzle ORM with PostgreSQL
- 🔒 **Secure Password Handling** - bcrypt encryption for password security
- 🧩 **Type Safety** - Full TypeScript support throughout the stack

## Technology Stack

- **Frontend**: React 19.2.0 + TypeScript + TanStack Router
- **Backend**: TanStack Start server functions
- **Database**: Drizzle ORM 0.44.6 + PostgreSQL
- **Styling**: Tailwind CSS 4.1.14 + DaisyUI 5.3.2
- **Testing**: Vitest 3.2.4 + React Testing Library + Playwright
- **Build Tool**: Vite 7.1.10
- **Package Manager**: pnpm

## Quick Start

### Prerequisites

- Node.js (18+ recommended)
- pnpm
- PostgreSQL (for database)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd tanstack-start-template

# Run setup script (installs dependencies, sets up database)
bin/setup

# Start development server
bin/dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Available Scripts

### Development

```bash
bin/dev            # Start development server
bin/build          # Build for production
bin/start          # Start production server
bin/setup          # Initial project setup
```

### Testing

```bash
bin/test           # Run all tests (unit + e2e)
bin/test-vitest    # Run unit tests with Vitest
bin/test-vitest-watch  # Run unit tests in watch mode
```

### Code Quality

```bash
bin/lint           # Run linter
bin/ts-check       # Run TypeScript compiler check
```

### Database

```bash
npx drizzle-kit generate    # Generate migration files
npx drizzle-kit migrate     # Apply pending migrations
npx drizzle-kit push        # Push schema changes directly
npx drizzle-kit studio      # Open Drizzle Studio database browser
```

## Project Structure

```
src/
├── routes/                 # File-based routing
│   ├── __root.tsx         # Root layout with navigation
│   ├── _authed.tsx        # Protected route layout
│   ├── _authed/           # Protected pages
│   ├── login.tsx          # Login page
│   ├── signup.tsx         # Registration page
│   └── logout.tsx         # Logout functionality
├── components/            # Reusable components
│   └── __tests__/         # Component tests
├── server/               # Server-side functions (layered architecture)
│   ├── db/               # Database layer
│   │   ├── index.ts      # Drizzle database client
│   │   └── schema.ts     # Database schema with relations
│   ├── services/         # Business logic layer
│   │   ├── userServices.ts     # User operations
│   │   ├── sessionService.ts   # Session management
│   │   ├── passwordService.ts  # Password utilities
│   │   └── todoService.ts      # Todo operations
│   ├── handlers/         # API endpoint layer
│   │   ├── userHandlers.ts     # User endpoints
│   │   ├── sessionHandlers.ts  # Auth endpoints
│   │   └── todoHandlers.ts     # Todo endpoints
│   ├── websession.ts     # Session utilities
│   ├── request-info.ts   # Request metadata
│   ├── seo.ts           # SEO utilities
│   └── __tests__/       # Server function tests
├── test/                 # Test utilities and setup
│   ├── setup.ts          # Test configuration
│   └── utils.tsx         # Testing utilities
└── errors.ts             # Custom error handling
bin/                      # Development scripts
├── dev                   # Start development server
├── build                 # Build for production
├── test                  # Run all tests
├── test-vitest          # Run unit tests
└── ...                  # Other utility scripts
```

## Authentication Flow

1. **Registration**: Users can create accounts with email/password
2. **Login**: Session-based authentication with encrypted cookies
3. **Protection**: Unauthenticated users are redirected to login
4. **Persistence**: Sessions survive browser restarts

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
SECRET_KEY_BASE="your-secret-key-for-session-encryption"
```

The setup script (`bin/setup`) will help you configure these variables interactively.

## Database Schema

The application uses a PostgreSQL database with Drizzle ORM, featuring optimized schemas with relations and performance indexes:

### Users

```typescript
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // bcrypt hashed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
```

### Sessions

```typescript
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    location: text("location"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  table => [
    index("sessions_user_id_idx").on(table.userId), // Performance optimization
  ]
);
```

### Todos

```typescript
export const todos = pgTable(
  "todos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => [
    index("todos_user_id_idx").on(table.userId), // Performance optimization
  ]
);
```

### Relations & Types

The schema includes Drizzle relations for type-safe queries and comprehensive TypeScript types:

```typescript
// Relations enable type-safe joins
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  todos: many(todos),
}));

// Exported types for full type safety
export type User = typeof users.$inferSelect;
export type UserWithoutPassword = Omit<User, "password">;
// ... and more
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Documentation

- [TanStack Start](https://tanstack.com/start)
- [TanStack Router](https://tanstack.com/router)
- [DaisyUI Components](https://daisyui.com/docs/v5/)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)

## License

This project is open source and available under the [MIT License](LICENSE).
