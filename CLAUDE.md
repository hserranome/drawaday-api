# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS TypeScript API for "Draw a Day" application. It's a REST API with authentication, user management, and profile functionality.

## Architecture

The application follows standard NestJS modular architecture:

- **Authentication Module** (`src/auth/`): JWT-based authentication with signup/login
- **User Module** (`src/user/`): User management with in-memory storage (no database)
- **Profile Module** (`src/profile/`): User profile management
- **Main App Module** (`src/app.module.ts`): Root module importing all feature modules

Key architectural decisions:
- Uses JWT tokens with 24-hour expiration
- Password hashing with bcrypt
- Global API prefix `/api` for all routes
- Zod validation with custom pipes and exception filters
- SQLite database with Drizzle ORM for persistent storage

## Development Commands

```bash
# Package management
pnpm install

# Development
pnpm run start:dev        # Watch mode development
pnpm run start:debug      # Debug mode with --inspect-brk
pnpm run start            # Regular development start
pnpm run start:prod       # Production mode

# Build
pnpm run build

# Testing
pnpm run test            # Unit tests
pnpm run test:watch      # Watch mode testing
pnpm run test:cov        # Test coverage
pnpm run test:e2e        # End-to-end tests
pnpm run test:debug      # Debug mode testing

# Database (Drizzle ORM)
pnpm run db:generate     # Generate migrations from schema
pnpm run db:migrate      # Run migrations
pnpm run db:studio       # Launch Drizzle Studio GUI

# Code Quality
pnpm run lint            # ESLint with auto-fix
pnpm run format          # Prettier formatting
```

## Key Technical Details

- **Port**: Defaults to 3000 (configurable via PORT environment variable)
- **JWT Secret**: Uses `JWT_SECRET` environment variable or falls back to default
- **Database**: SQLite with Drizzle ORM (file: `./data/database.sqlite`)
- **Validation**: Uses Zod schemas with custom validation pipes for superior type safety
- **Password Security**: bcrypt hashing with secure comparison
- **Type Safety**: Full end-to-end type safety with Drizzle-inferred types and Zod schemas

## Module Dependencies

- DatabaseModule is global and provides database connection
- AuthModule depends on UserModule
- All modules imported into AppModule
- JWT strategy configured for passport authentication
- Global validation and API prefix configured in main.ts

## Modern Architecture Features

- **Drizzle ORM**: Type-safe database operations with SQLite
- **Zod Validation**: Runtime type validation with excellent TypeScript integration
- **Custom Pipes**: ZodValidationPipe for request validation
- **Global Filters**: ZodExceptionFilter for consistent error handling
- **Schema Management**: Drizzle-Zod integration for single source of truth
- **Migrations**: Automatic schema migrations on startup

## Testing Setup

- Jest configured for unit tests with ts-jest transformer
- E2E tests configured with separate Jest config
- Tests located in `src/` directory with `.spec.ts` suffix
- Coverage reports generated in `coverage/` directory
- API test utilities in `test/api-test.js` for integration testing