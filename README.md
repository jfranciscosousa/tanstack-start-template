# my-tanstack-starter

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
cd my-tanstack-starter

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
bin/test-e2e       # Run e2e tests with Playwright
bin/test-e2e-ui    # Run e2e tests with Playwright UI
```

### Code Quality

```bash
bin/lint           # Run linter
bin/format         # Format code
bin/ts-check       # Run TypeScript compiler check
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
bin/               # Development, test, and build scripts
```

## Authentication Flow

1. **Registration**: Users can create accounts with email/password
2. **Login**: Session-based authentication with encrypted cookies
3. **Protection**: Unauthenticated users are redirected to login
4. **Persistence**: Sessions survive browser restarts

## Environment Variables

The setup script (`bin/setup`) will help you configure your environment automatically. It sets up two files, `.env` and `.env.test` that are using on development and testing environments for you.

It will also help you rename the app to suit your needs.

## Database

The application uses PostgreSQL with Drizzle ORM. The schema is defined in `src/server/db/schema.ts`. Use `drizzle-kit` to manage migrations:

```bash
bin/db generate    # Generate migration files from schema changes
bin/db migrate     # Apply pending migrations
bin/db studio      # Open Drizzle Studio database browser
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
