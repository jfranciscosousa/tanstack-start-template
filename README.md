# TanStack Start Template

A modern full-stack React application built with TanStack Start, featuring complete authentication functionality and a clean, responsive design.

## Features

- 🔐 **Complete Authentication System** - User registration, login, logout with session management
- 🛡️ **Route Protection** - Automatic redirects for protected routes
- 🎨 **Modern UI** - Tailwind CSS + DaisyUI component library
- 📱 **Responsive Design** - Mobile-first approach with clean navigation
- 🗄️ **Database Integration** - Prisma ORM with SQLite
- 🔒 **Secure Password Handling** - bcrypt encryption for password security
- 🧩 **Type Safety** - Full TypeScript support throughout the stack

## Technology Stack

- **Frontend**: React 19.2.0 + TypeScript + TanStack Router
- **Backend**: TanStack Start server functions
- **Database**: Prisma 6.17.0 + SQLite
- **Styling**: Tailwind CSS 4.1.14 + DaisyUI 5.1.31
- **Testing**: Vitest 3.2.4 + React Testing Library
- **Build Tool**: Vite 7.1.9
- **Package Manager**: pnpm

## Quick Start

### Prerequisites

- Node.js (18+ recommended)
- pnpm

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
bin/lint           # Run ESLint
bin/ts-check       # Run TypeScript compiler check
```

### Database
```bash
pnpm prisma-generate    # Generate Prisma client
npx prisma migrate dev  # Run database migrations
npx prisma studio      # Open database browser
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
├── server/               # Server-side functions
│   ├── sessions.ts       # Authentication logic
│   ├── users.ts          # User management
│   ├── prisma.ts         # Database client
│   └── __tests__/        # Server function tests
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
DATABASE_URL="file:./dev.db"
SECRET_KEY_BASE="your-secret-key-for-session-encryption"
```

## Database Schema

The application includes a User model with the following structure:

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hashed
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
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
- [Prisma Documentation](https://www.prisma.io/docs)

## License

This project is open source and available under the [MIT License](LICENSE).
