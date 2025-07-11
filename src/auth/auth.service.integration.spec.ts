import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { TestDatabase, testUsers } from '../../test/utils/test-helpers';

describe('AuthService (Integration)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let userService: UserService;
  let db: TestDatabase;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = app.get(AuthService);
    userService = app.get(UserService);
    db = new TestDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await db.cleanup();
  });

  describe('signup', () => {
    it('should create a new user and return an access token', async () => {
      const { email, password } = testUsers.validUser;
      const result = await authService.signup({ email, password });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(email);
      expect(result.user).not.toHaveProperty('password');

      const dbUser = await db.findUserByEmail(email);
      expect(dbUser).toBeDefined();
      expect(dbUser?.email).toBe(email);
    });

    it('should throw an error if the user already exists', async () => {
      const { email, password } = testUsers.validUser;
      await userService.createUser(email, password);

      await expect(authService.signup({ email, password })).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      const { email, password } = testUsers.validUser;
      await userService.createUser(email, password);
      const foundUser = await db.findUserByEmail(email);
      if (!foundUser) throw new Error('User not found in db');
    });

    it('should return an access token for valid credentials', async () => {
      const { email, password } = testUsers.validUser;
      const result = await authService.login({ email, password });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(email);
    });

    it('should throw an error for invalid password', async () => {
      const { email } = testUsers.validUser;
      await expect(
        authService.login({ email, password: 'wrongpassword' }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw an error for non-existent user', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@user.com',
          password: 'password',
        }),
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
