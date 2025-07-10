# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Linting and Code Quality Guidelines

- Disabling eslint rules (e.g., with eslint-disable comments) should only be used as a last resort or for clarity/future-proofing. Prefer to address linter warnings by refactoring code (such as removing unused parameters) whenever possible.

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
- Swagger/OpenAPI documentation for all endpoints

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

# Database (MikroORM)
pnpm run migration:create --name=<name>    # Create new migration with current schema diff
pnpm run migration:up                      # Apply pending migrations
pnpm run migration:down                    # Rollback last migration
pnpm run migration:list                    # List all executed migrations
pnpm run migration:pending                 # List pending migrations
pnpm run db:debug                          # Verify MikroORM setup and configuration

# Code Quality
pnpm run lint            # ESLint with auto-fix
pnpm run format          # Prettier formatting
```

## API Documentation

- **Swagger UI**: Available at `http://localhost:3000/api/docs`
- **OpenAPI JSON**: Available at `http://localhost:3000/api/docs-json`
- **Authentication**: JWT Bearer token authentication
- **Request/Response DTOs**: Fully documented with examples and validation rules
- **Error Responses**: Comprehensive error documentation for all endpoints

## Key Technical Details

- **Port**: Defaults to 3000 (configurable via PORT environment variable)
- **JWT Secret**: Uses `JWT_SECRET` environment variable or falls back to default
- **Database**: SQLite with MikroORM (file: `./data/database.sqlite`)
- **Validation**: Uses Zod schemas with custom validation pipes for superior type safety
- **Password Security**: bcrypt hashing with secure comparison
- **Type Safety**: Full end-to-end type safety with MikroORM entities and Zod schemas
- **API Documentation**: Swagger/OpenAPI with interactive UI and JSON schema

## Module Dependencies

- DatabaseModule is global and provides database connection
- AuthModule depends on UserModule
- All modules imported into AppModule
- JWT strategy configured for passport authentication
- Global validation and API prefix configured in main.ts

## Modern Architecture Features

- **MikroORM**: Type-safe database operations with SQLite using entity-based approach
- **Zod Validation**: Runtime type validation with excellent TypeScript integration
- **Custom Pipes**: ZodValidationPipe for request validation
- **Global Filters**: ZodExceptionFilter for consistent error handling
- **Schema Management**: MikroORM entities with separate Zod schemas for validation
- **Entity Management**: Repository pattern with EntityManager for database operations
- **API Documentation**: Swagger/OpenAPI with comprehensive endpoint documentation
- **Request/Response DTOs**: Type-safe API contracts with validation examples

## Testing Setup

- Jest configured for unit tests with ts-jest transformer
- E2E tests configured with separate Jest config
- Tests located in `src/` directory with `.spec.ts` suffix
- Coverage reports generated in `coverage/` directory
- API test utilities in `test/api-test.js` for integration testing
