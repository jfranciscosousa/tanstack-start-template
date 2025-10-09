# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A production-ready TanStack Start template featuring complete authentication functionality. This full-stack React application demonstrates modern web development patterns with session-based authentication, type-safe routing, and responsive design using contemporary React patterns and TypeScript.

## Technology Stack

- **TanStack Start**: Full-stack React framework with file-based routing and server functions
- **TanStack Router**: Type-safe routing with nested layouts and automatic code splitting
- **React 19.1.0** with **TypeScript 5.x**: Latest React with concurrent features
- **Prisma 6.12.0** with SQLite database for development (PostgreSQL ready)
- **Tailwind CSS 4.1.11** + **DaisyUI 5.0.46**: Utility-first CSS with component library
- **Vite 7.0.5**: Fast build tooling with HMR and optimized bundling
- **pnpm**: Fast, disk space efficient package manager
- **bcrypt-ts**: Secure password hashing
- **Zod**: Schema validation for forms and API inputs

## Development Commands

### Core Development
```bash
pnpm dev           # Start development server (http://localhost:3000)
pnpm build         # Build for production
pnpm start         # Start production server
pnpm preview       # Preview production build locally
```

### Database Management
```bash
pnpm prisma-generate    # Generate Prisma client after schema changes
npx prisma migrate dev  # Create and apply new migration
npx prisma db push      # Push schema changes without migration
npx prisma studio      # Open database browser UI
npx prisma db seed     # Run database seed script (if configured)
```

### Code Quality
```bash
pnpm lint          # Run ESLint (if configured)
pnpm type-check    # Run TypeScript compiler check
pnpm format        # Format code with Prettier (if configured)
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

### Key Server Functions (src/server/)
- `sessions.ts`: Login functionality with password verification and session creation
- `users.ts`: User registration with email uniqueness validation and password hashing
- `websession.ts`: Session utilities, user context management, and session validation
- `passwords.ts`: Password hashing, verification utilities, and security helpers
- `prisma.ts`: Database client configuration with connection pooling

### Database Schema (Prisma)
Current schema optimized for authentication:
```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hashed with salt
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
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
- **prisma/schema.prisma**: Database schema with SQLite for dev, PostgreSQL ready
- **tailwind.config.ts**: Tailwind configuration with DaisyUI plugin and custom theme

### Package Configuration
- **package.json**: Dependencies, scripts, and project metadata
- **.env**: Environment variables (excluded from git)
- **.gitignore**: Git exclusions including env files and build artifacts

## Environment Variables

### Required Variables
```bash
DATABASE_URL="file:./dev.db"              # SQLite for dev, PostgreSQL for prod
SECRET_KEY_BASE="your-secret-key"         # Session encryption (32+ chars)
```

### Optional Variables
```bash
NODE_ENV="development"                     # Environment mode
PORT="3000"                               # Server port
```

## Styling Guidelines

### Design System
- **Framework**: Tailwind CSS 4.1.11 for utility-first styling
- **Components**: DaisyUI 5.0.46 for pre-built, accessible components
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
- **Types**: Define TypeScript interfaces in component files or shared types
- **Server Functions**: Keep server logic in `src/server/` directory
- **Components**: Reusable components in `src/components/`

### Security Practices
- **Input Validation**: Validate all user inputs with Zod schemas
- **Password Security**: Use bcrypt with appropriate salt rounds
- **Session Security**: HTTP-only cookies with secure flags in production
- **Error Handling**: Never expose sensitive information in error messages

### Performance Considerations
- **Code Splitting**: Automatic with TanStack Router
- **Database**: Use Prisma's query optimization features
- **Caching**: Leverage TanStack Start's built-in caching
- **Bundle Size**: Monitor bundle size with Vite's analysis tools

## Deployment Considerations

### Production Setup
- Set `NODE_ENV=production`
- Use PostgreSQL instead of SQLite
- Configure proper `SECRET_KEY_BASE`
- Enable HTTPS for secure cookies
- Set up database migrations pipeline

### Environment-Specific Notes
- **Development**: Uses SQLite with file-based database
- **Production**: Recommended to use PostgreSQL or MySQL
- **Testing**: Configure separate test database