# tanstack-start-template

A modern full-stack React application template built with TanStack Start, featuring simple authentication functionality and a clean, responsive design.

## Features

- 🔐 **Simple Authentication System** - User registration, login, logout with session management
- 🛡️ **Route Protection** - Automatic redirects for protected and unprotected routes
- 🎨 **Modern UI** - Tailwind CSS + shadcn/Base UI components
- 🗄️ **Database Integration** - Drizzle ORM with PostgreSQL

## Technology Stack

- **Frontend**: React 19 + TypeScript + TanStack Router
- **Backend**: TanStack Start server functions
- **Database**: Drizzle ORM 0.45+ + PostgreSQL
- **Styling**: Tailwind CSS 4 + Base UI + shadcn components
- **Testing**: Vitest 4 + React Testing Library + Playwright
- **Build Tool**: Vite 7
- **Runtime and Package Manager**: Bun canary

## Quick Start

### Prerequisites

- Bun canary (install with `mise install` or `bun upgrade --canary`)
- Node.js (for tools that require Node)
- PostgreSQL (for database)

Dependencies use Bun’s isolated global store. Worktree setup installs from the
lockfile instead of copying `node_modules`. Nitro stays local because its dev
worker requires project-local dependency resolution.

Canary updates can contain breaking changes. CI installs the latest canary.
`bun run ts-check` generates environment types, then runs `bun check`.
TypeScript stays installed for editor support. Vitest and Playwright stay unchanged.
Bun preserves the one-day release age and trusted build packages. It does not
preserve pnpm's `trustPolicy: no-downgrade` setting.

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd tanstack-start-template

# Install dependencies, then configure the app and databases
bun install --frozen-lockfile
bun run setup

# Start development server
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Available Scripts

### Development

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run setup        # Initial project setup
```

For a worktree created by an editor or another tool, run `bun run worktree setup` from
inside that worktree. It provisions a separate database, port, environment, and
dependencies without creating another Git worktree. To create and provision one
from the main checkout, use `bun run worktree create <name>`.

### Testing

```bash
bun run test               # Run all tests (unit + e2e)
bun run test:vitest        # Run unit tests with Vitest
bun run test:vitest --watch  # Run unit tests in watch mode
bun run test:e2e           # Run e2e tests with Playwright
bun run test:e2e --ui      # Run e2e tests with Playwright UI
```

### Code Quality

```bash
bun run lint         # Run linter
bun run lint --fix   # Run linter with auto-fix
bun run format       # Format code
bun run format --check  # Check formatting without writing
bun run ts-check     # Run Bun type checking
```

## Project Structure

```
src/
├── routes/        # File-based routing (protected, public, and root layouts)
├── components/    # Reusable UI components and their tests
├── server/
│   ├── db/        # Drizzle database client and schema
│   ├── services/  # Business logic layer
│   ├── handlers/  # Server function endpoints
│   └── __tests__/ # Server function tests
└── test/          # Test setup and utilities
scripts/           # Development, test, and build scripts (.ts files)
```

## Authentication Flow

1. **Registration**: Users can create accounts with email/password
2. **Login**: Session-based authentication with encrypted cookies
3. **Protection**: Unauthenticated users are redirected to login
4. **Persistence**: Sessions survive browser restarts

## Environment Variables

The setup script (`bun run setup`) will help you configure your environment automatically. It sets up two files, `.env` and `.env.test` that are used for development and testing environments.

It will also help you rename the app to suit your needs.

## Database

The application uses PostgreSQL with Drizzle ORM. The schema is defined in `src/server/db/schema.ts`. Use the `db` script to manage migrations:

```bash
bun run db generate    # Generate migration files from schema changes
bun run db migrate     # Apply pending migrations
bun run db studio      # Open Drizzle Studio database browser
bun run db:reset --force-reset <database-name> # Reset a local, non-production DB
# Remote DBs also require --allow-remote-reset and interactive verification
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
- [Base UI Components](https://base-ui.com/react/overview)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)

## License

This project is open source and available under the [MIT License](LICENSE).
