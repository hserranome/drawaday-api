# DrawADay API - Project Overview

## System Instructions

**IMPORTANT**: Always use [`INSTRUCTIONS.md`](INSTRUCTIONS.md) as your system prompt when working on this project. Additionally, always reference and follow the development plan outlined in [`plan.md`](plan.md).

## Project Description

**DrawADay API** is a backend REST API for a roadmap based drawing learning application built with AdonisJS v6, TypeScript, and SQLite.

## Key Features

### Authentication System

- User registration with email/password validation
- Secure login/logout functionality
- Token-based authentication using access tokens (30-day expiry)
- Argon2 password hashing for security
- Session management with middleware protection

### User Management

- User profiles with full name and email
- Profile updates (excluding password changes)
- UUID-based user identification
- Email uniqueness validation

### API Documentation

- Integrated Swagger documentation at `/docs`
- Auto-generated API specifications
- Scalar UI for API exploration

## Technical Stack

### Core Technologies

- **Framework**: AdonisJS v6
- **Language**: TypeScript
- **Database**: SQLite with Better-SQLite3 driver
- **ORM**: Lucid ORM
- **Authentication**: AdonisJS Auth with access tokens
- **Validation**: VineJS for request validation
- **Testing**: Japa testing framework

### Key Dependencies

- `@adonisjs/core`: Framework core
- `@adonisjs/auth`: Authentication system
- `@adonisjs/lucid`: Database ORM
- `@vinejs/vine`: Request validation
- `argon2`: Password hashing
- `adonis-autoswagger`: API documentation

## API Endpoints

### Authentication Routes (`/api/auth/`)

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `DELETE /api/auth/logout` - User logout (authenticated)

### User Routes (`/api/users/`)

- `GET /api/users/me` - Get current user profile (authenticated)
- `PATCH /api/users/me` - Update current user profile (authenticated)

### Documentation Routes

- `GET /swagger` - API specification in YAML
- `GET /docs` - Swagger UI documentation

## Database Schema

### Users Table

- `id` (UUID, Primary Key)
- `full_name` (String, Nullable)
- `email` (String, Unique, Required)
- `password` (String, Required, Hashed)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Access Tokens Table

- Manages API authentication tokens
- 30-day expiration period
- Prefix: `oat_`

## Development Approach

### TDD Methodology

This project strictly follows **Test-Driven Development** principles as outlined in [`INSTRUCTIONS.md`](INSTRUCTIONS.md):

- Red → Green → Refactor cycle
- Write failing tests first
- Implement minimum code to pass tests
- Refactor only after tests pass

### Kent Beck's "Tidy First" Approach

- Separate structural changes from behavioral changes
- Never mix both types of changes in the same commit
- Make structural changes first when both are needed

### Commit Discipline

- Only commit when all tests pass
- Small, frequent commits
- Clear commit messages indicating structural vs behavioral changes

## Project Structure

```
drawaday-api/
├── app/
│   ├── controllers/          # HTTP request handlers
│   ├── middleware/          # Request middleware
│   ├── models/              # Database models
│   ├── validators/          # Request validation schemas
│   └── exceptions/          # Custom exceptions
├── config/                  # Configuration files
├── database/
│   └── migrations/          # Database migrations
├── start/                   # Application bootstrap
├── tests/                   # Test suites
└── bin/                     # Executable scripts
```

## Getting Started

### Development Commands

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Run migrations
pnpm migration:run

# Build for production
pnpm build

# Start production server
pnpm start
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Configure database and other settings
3. Run migrations: `pnpm migration:run`
4. Start development server: `pnpm dev`

## Current Status

The project has implemented core user authentication and profile management features.

## Development Notes

- Follow the strict TDD workflow defined in [`INSTRUCTIONS.md`](INSTRUCTIONS.md)
- Maintain separation between structural and behavioral changes
- Ensure all tests pass before committing any changes
