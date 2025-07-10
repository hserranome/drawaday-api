import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MikroORM } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/sqlite';
import { AppModule } from '../../src/app.module';
import { User } from '../../src/entities/user.entity';
import { ZodExceptionFilter } from '../../src/common/filters/zod-exception.filter';
import { UserWithoutPassword } from '../../src/models/user.model';
import { UserService } from '../../src/user/user.service';

export interface TestUser {
  email: string;
  password: string;
}

export interface TestUserWithToken extends UserWithoutPassword {
  access_token: string;
}

/**
 * Creates a test NestJS application instance
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Apply same configuration as main.ts
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new ZodExceptionFilter());

  await app.init();
  return app;
}

/**
 * Cleans up the test database
 */
export async function cleanupDatabase(app: INestApplication): Promise<void> {
  const orm = app.get(MikroORM);
  const userRepository = orm.em.getRepository(User);
  await userRepository.nativeDelete({});
}

/**
 * Creates a test user in the database
 */
export async function createTestUser(
  app: INestApplication,
  userData: TestUser,
): Promise<TestUserWithToken> {
  const userService = app.get(UserService);
  const jwtService = app.get(JwtService);

  const user = await userService.createUser(userData.email, userData.password);
  const payload = { sub: user.id, email: user.email };
  const access_token = await jwtService.signAsync(payload);

  return {
    ...user,
    access_token,
  };
}

/**
 * Creates a valid JWT token for testing
 */
export async function createTestToken(
  app: INestApplication,
  user: UserWithoutPassword,
): Promise<string> {
  const jwtService = app.get(JwtService);
  const payload = { sub: user.id, email: user.email };
  return await jwtService.signAsync(payload);
}

/**
 * Creates an invalid JWT token for testing
 */
export function createInvalidToken(): string {
  return 'invalid.jwt.token';
}

/**
 * Creates an expired JWT token for testing
 */
export async function createExpiredToken(
  app: INestApplication,
  user: UserWithoutPassword,
): Promise<string> {
  const jwtService = app.get(JwtService);
  const payload = { sub: user.id, email: user.email };

  // Create token with very short expiry (1 second)
  const token = await jwtService.signAsync(payload, { expiresIn: '1s' });

  // Wait for it to expire
  await new Promise((resolve) => setTimeout(resolve, 1100));

  return token;
}

/**
 * Sample test data
 */
export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'password123',
  },
  anotherUser: {
    email: 'another@example.com',
    password: 'anotherpassword123',
  },
  invalidEmailUser: {
    email: 'invalid-email',
    password: 'password123',
  },
  shortPasswordUser: {
    email: 'test@example.com',
    password: '123',
  },
};

/**
 * Common test assertions
 */
export const testAssertions = {
  shouldHaveUserResponse: (response: Record<string, unknown>) => {
    expect(response).toHaveProperty('user');
    expect(response).toHaveProperty('access_token');
    expect(response.user).not.toHaveProperty('password');
    expect(response.user).toHaveProperty('id');
    expect(response.user).toHaveProperty('email');
    expect(response.user).toHaveProperty('createdAt');
  },

  shouldHaveValidationError: (
    response: Record<
      string,
      {
        body: {
          message: string;
          errors: Array<{ field: string; message: string }>;
        };
      }
    >,
    field: string,
    message: string,
  ) => {
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors).toContainEqual({
      field,
      message,
    });
  },

  shouldBeUnauthorized: (
    response: Record<string, { status: number; body: { message: string } }>,
  ) => {
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  },
};

/**
 * Database setup and teardown helpers
 */
export class TestDatabase {
  private app: INestApplication;
  private orm: MikroORM;
  private userRepository: EntityRepository<User>;

  constructor(app: INestApplication) {
    this.app = app;
    this.orm = app.get(MikroORM);
    this.userRepository = this.orm.em.getRepository(User);
  }

  async cleanup(): Promise<void> {
    await this.userRepository.nativeDelete({});
  }

  async createUser(userData: TestUser): Promise<UserWithoutPassword> {
    const userService = this.app.get(UserService);
    return await userService.createUser(userData.email, userData.password);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ email });
  }

  async getUserCount(): Promise<number> {
    return await this.userRepository.count();
  }
}

/**
 * Mock factories for testing
 */
export const mockFactory = {
  createMockUser: (
    overrides: Partial<UserWithoutPassword> = {},
  ): UserWithoutPassword => ({
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    createdAt: new Date(),
    ...overrides,
  }),

  createMockAuthResponse: (user?: UserWithoutPassword) => ({
    user: user || mockFactory.createMockUser(),
    access_token: 'mock-jwt-token',
  }),

  createMockRequest: (user?: UserWithoutPassword) => ({
    user: user || mockFactory.createMockUser(),
  }),
};
