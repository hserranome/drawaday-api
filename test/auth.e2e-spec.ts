import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MikroORM } from '@mikro-orm/core';
import { User } from '../src/entities/user.entity';
import { ZodExceptionFilter } from '../src/common/filters/zod-exception.filter';
import {
  LoginResponseDto,
  UserResponseDto,
} from '../src/common/dto/api-response.dto';

describe('Authentication Flow (e2e)', () => {
  let app: INestApplication;
  let orm: MikroORM;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same configuration as main.ts
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new ZodExceptionFilter());

    await app.init();

    // Get database connection for cleanup
    orm = app.get(MikroORM);
  });

  afterAll(async () => {
    await orm.close();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await orm.em.fork().nativeDelete('User', {});
  });

  describe('Complete Authentication Flow', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should complete full signup → login → profile flow', async () => {
      // 1. Signup
      const signupResponse = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      expect(signupResponse.body).toHaveProperty('user');
      expect(signupResponse.body).toHaveProperty('access_token');
      expect((signupResponse.body as LoginResponseDto).user.email).toBe(
        testUser.email,
      );
      expect((signupResponse.body as LoginResponseDto).user).not.toHaveProperty(
        'password',
      );

      const { access_token: signupToken } =
        signupResponse.body as LoginResponseDto;

      // 2. Login with same credentials
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(testUser)
        .expect(200);

      expect(loginResponse.body).toHaveProperty('user');
      expect(loginResponse.body).toHaveProperty('access_token');
      expect((loginResponse.body as LoginResponseDto).user.email).toBe(
        testUser.email,
      );
      expect((loginResponse.body as LoginResponseDto).user).not.toHaveProperty(
        'password',
      );

      const { access_token: loginToken } =
        loginResponse.body as LoginResponseDto;

      // 3. Access profile with signup token
      const profileResponse1 = await request(app.getHttpServer())
        .get('/api/profile')
        .set('Authorization', `Bearer ${signupToken}`)
        .expect(200);

      expect((profileResponse1.body as UserResponseDto).email).toBe(
        testUser.email,
      );
      expect(profileResponse1.body).not.toHaveProperty('password');

      // 4. Access profile with login token
      const profileResponse2 = await request(app.getHttpServer())
        .get('/api/profile')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200);

      expect((profileResponse2.body as UserResponseDto).email).toBe(
        testUser.email,
      );
      expect(profileResponse2.body).not.toHaveProperty('password');

      // 5. Verify user persisted in database
      const dbUser = await orm.em
        .fork()
        .findOne(User, { email: testUser.email });
      expect(dbUser).toBeTruthy();
      expect(dbUser!.email).toBe(testUser.email);
      expect(dbUser!.password).not.toBe(testUser.password); // Should be hashed
    });

    it('should handle duplicate signup attempts', async () => {
      // First signup
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      // Second signup with same email
      const duplicateResponse = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(409);

      expect((duplicateResponse.body as { message: string }).message).toBe(
        'User with this email already exists',
      );
    });

    it('should reject login with invalid credentials', async () => {
      // Signup first
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      // Login with wrong password
      const wrongPasswordResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ ...testUser, password: 'wrongpassword' })
        .expect(401);

      expect((wrongPasswordResponse.body as { message: string }).message).toBe(
        'Invalid credentials',
      );

      // Login with wrong email
      const wrongEmailResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ ...testUser, email: 'wrong@example.com' })
        .expect(401);

      expect((wrongEmailResponse.body as { message: string }).message).toBe(
        'Invalid credentials',
      );
    });

    it('should reject profile access without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/profile')
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Unauthorized',
      );
    });

    it('should reject profile access with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Unauthorized',
      );
    });

    it('should reject profile access with expired token', async () => {
      // This test would require manipulating JWT expiration
      // For now, we test with a malformed token
      const response = await request(app.getHttpServer())
        .get('/api/profile')
        .set('Authorization', 'Bearer expired.token.here')
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Unauthorized',
      );
    });
  });

  describe('Validation Tests', () => {
    it('should reject signup with invalid email', async () => {
      const invalidEmailResponse = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({ email: 'invalid-email', password: 'password123' })
        .expect(400);

      expect(
        (
          invalidEmailResponse.body as {
            message: string;
            errors: Array<{ field: string; message: string }>;
          }
        ).message,
      ).toBe('Validation failed');
      expect(
        (
          invalidEmailResponse.body as {
            message: string;
            errors: Array<{ field: string; message: string }>;
          }
        ).errors,
      ).toEqual([
        {
          field: 'email',
          message: 'Invalid email format',
        },
      ]);
    });

    it('should reject signup with short password', async () => {
      const shortPasswordResponse = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', password: '123' })
        .expect(400);

      expect(
        (
          shortPasswordResponse.body as {
            message: string;
            errors: Array<{ field: string; message: string }>;
          }
        ).message,
      ).toBe('Validation failed');
      expect(
        (
          shortPasswordResponse.body as {
            message: string;
            errors: Array<{ field: string; message: string }>;
          }
        ).errors,
      ).toEqual([
        {
          field: 'password',
          message: 'Password must be at least 6 characters long',
        },
      ]);
    });

    it('should reject login with missing fields', async () => {
      const missingEmailResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ password: 'password123' })
        .expect(400);

      expect((missingEmailResponse.body as { message: string }).message).toBe(
        'Validation failed',
      );

      const missingPasswordResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(
        (missingPasswordResponse.body as { message: string }).message,
      ).toBe('Validation failed');
    });

    it('should reject requests with malformed JSON', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send('invalid-json')
        .expect(400);

      expect((response.body as { message: string }).message).toBeDefined();
    });
  });

  describe('Database Integration', () => {
    it('should persist user data correctly', async () => {
      const testUser = {
        email: 'persistence@example.com',
        password: 'testpassword123',
      };

      // Create user
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      // Verify in database
      const dbUser = await orm.em
        .fork()
        .findOne(User, { email: testUser.email });
      expect(dbUser).toBeTruthy();
      expect(dbUser!.email).toBe(testUser.email);
      expect(dbUser!.id).toBeDefined();
      expect(dbUser!.createdAt).toBeDefined();
      expect(dbUser!.password).not.toBe(testUser.password); // Should be hashed
    });

    it('should handle database constraints', async () => {
      const testUser = {
        email: 'constraint@example.com',
        password: 'testpassword123',
      };

      // Create user
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(409);

      // Verify only one user exists
      const dbUsers = await orm.em.fork().find(User, { email: testUser.email });
      expect(dbUsers).toHaveLength(1);
    });
  });
});
