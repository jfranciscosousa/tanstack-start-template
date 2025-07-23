# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Expense Wizard** is a full-stack React application for expense management and CSV data processing. Users can upload CSV files, map columns to required fields, validate data, and manage financial transactions.

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

### File-based Routing
- Routes in `src/routes/` follow TanStack Router conventions
- `__root.tsx`: Main layout with navigation
- `_authed.tsx`: Protected route layout requiring authentication
- `_authed/upload.tsx`: CSV upload page (protected)

### Authentication System
- Session-based auth using custom session management
- `server/session.server.ts`: Session utilities
- `server/users.ts`: User operations with bcrypt password hashing
- Protected routes use `_authed` layout pattern

### Database Schema
```
User (id, email, hashedPassword)
├─ Category (id, name, userId) 
└─ Transaction (id, date, description, value, categoryId, userId)
```

### CSV Processing Architecture
The upload system has sophisticated data processing capabilities:

**Upload Flow**: `Upload.tsx` → CSV parsing → column mapping → `DataPreview.tsx` → validation → (TODO: database persistence)

**Key Features**:
- Dynamic column mapping to required fields (date, description, value, category)
- Multiple date formats: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, DD-MM-YYYY, MM-DD-YYYY, YYYY/MM/DD
- Multiple number formats with various decimal/thousands separators
- localStorage persistence for mapping settings
- Real-time validation with error reporting
- Paginated preview interface

**Data Transformation**: Raw CSV → parsed objects → mapped fields → validated data → preview with error highlighting

## Component Structure

### Core Components
- `components/Auth.tsx`: Authentication form wrapper
- `components/Login.tsx` & `SignUp.tsx`: Authentication forms
- `views/Upload/Upload.tsx`: Main CSV upload interface with column mapping
- `views/Upload/DataPreview.tsx`: Data validation and preview with pagination

### Server Functions
Use `createServerFn` for type-safe server-side operations:
- Authentication functions in `server/users.ts`
- Session management in `server/session.server.ts`

## Styling Guidelines

- Uses DaisyUI semantic color system for automatic light/dark mode support
- Primary text: `text-base-content`
- Muted text: `text-base-content/70`
- Error text: `text-error`
- Cards: `card bg-base-100 shadow-xl` with `card-body`
- Buttons: `btn btn-primary`, `btn btn-success`, etc.
- Forms: `select select-bordered`, `file-input file-input-bordered file-input-primary`

## Database Development

- Database file: `prisma/dev.db`
- Schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations/`
- Always run `pnpm prisma-generate` after schema changes

## Configuration

- **vite.config.ts**: TanStack Start + Tailwind + TypeScript paths
- **tsconfig.json**: Strict TypeScript with path mapping (`~/`)
- **.npmrc**: pnpm with `shamefully-hoist=true`
- **.env**: Database URL configuration

## Current Development Status

**Completed**: Authentication system, CSV upload/parsing, column mapping, data validation, preview interface, database schema

**In Progress**: CSV data persistence to database (currently shows placeholder in `Upload.tsx` handleSubmit function)

**Architecture Note**: The CSV processing system is designed to handle complex data transformation and validation before database persistence. The `previewData` state contains validated, converted data ready for database insertion.