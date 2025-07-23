# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A TanStack Start template with basic authentication functionality. This is a full-stack React application demonstrating session-based authentication with user registration and login capabilities.

## Technology Stack

- **TanStack Start**: Full-stack React framework with file-based routing
- **TanStack Router**: Type-safe routing with nested layouts
- **React 19.1.0** with **TypeScript**
- **Prisma 6.12.0** with SQLite database
- **Tailwind CSS 4.1.11** + **DaisyUI 5.0.46** for styling
- **Vite 7.0.5** for build tooling
- **pnpm** as package manager

## Development Commands

### Core Development
```bash
pnpm dev           # Start development server (http://localhost:3000)
pnpm build         # Build for production
pnpm start         # Start production server
```

### Database
```bash
pnpm prisma-generate    # Generate Prisma client after schema changes
npx prisma migrate dev  # Run database migrations
npx prisma studio      # Open database browser
```

## Architecture

### File-based Routing Structure
- Routes in `src/routes/` follow TanStack Router conventions
- `__root.tsx`: Root layout with user context, navigation, and global providers
- `_authed.tsx`: Protected route layout requiring authentication (redirects to login if not authenticated)
- `_authed/index.tsx`: Protected dashboard/home page
- `login.tsx`: Login page with authentication form
- `signup.tsx`: User registration page
- `logout.tsx`: Logout functionality

### Authentication System
- **Session Management**: Uses TanStack Start's `useSession` with encrypted cookies
- **Password Security**: bcrypt-ts for password hashing and verification
- **Server Functions**: Type-safe server-side operations using `createServerFn`
- **Route Protection**: `_authed` layout automatically redirects unauthenticated users to login
- **Session Persistence**: Users stay logged in across browser sessions

### Key Server Functions
- `server/sessions.ts`: Login functionality with password verification
- `server/users.ts`: User registration with email uniqueness validation
- `server/websession.ts`: Session utilities and user context management
- `server/passwords.ts`: Password hashing and verification utilities
- `server/prisma.ts`: Database client configuration

### Database Schema
Current schema includes:
```
User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String   (hashed)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Error Handling
- Custom `AppError` class in `src/errors.ts` with standardized error codes
- Zod validation error formatting for form inputs
- Consistent error messaging across authentication flows

## Component Structure

### Core Components
- `components/Navbar.tsx`: Navigation bar with user context and logout
- `components/SignUp.tsx`: Registration form with validation
- `components/DefaultCatchBoundary.tsx`: Error boundary for route errors
- `components/NotFound.tsx`: 404 page component

### Authentication Flow
1. User visits protected route → redirected to `/login` with return URL
2. Login form validates credentials → creates session → redirects back
3. Registration creates new user → auto-login → redirects to dashboard
4. Logout clears session → redirects to login

## Configuration Files

- **vite.config.ts**: TanStack Start plugin + TypeScript paths + Tailwind + type checking
- **tsconfig.json**: Strict TypeScript with path mapping (`~/src/*`)
- **prisma/schema.prisma**: SQLite database with User model

## Environment Variables

Required environment variables:
- `DATABASE_URL`: SQLite database file path (defaults to `file:./dev.db`)
- `SECRET_KEY_BASE`: Session encryption key (required for production)

## Styling Guidelines

Uses DaisyUI component library with Tailwind CSS. Check their docs here: https://daisyui.com/docs/v5/