import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UserWithoutPassword } from '../models/user.model';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUserWithoutPassword: UserWithoutPassword = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    createdAt: new Date(),
  };

  const mockAuthResponse = {
    user: mockUserWithoutPassword,
    access_token: 'mockAccessToken',
  };

  beforeEach(async () => {
    const mockAuthService = {
      signup: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('signup', () => {
    const validSignupDto: SignupDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return user and access token when signup is successful', async () => {
      (authService.signup as jest.Mock).mockResolvedValue(mockAuthResponse);

      const result = await authController.signup(validSignupDto);

      expect(result).toEqual(mockAuthResponse);
      expect(result.user).not.toHaveProperty('password');
      expect(typeof result.access_token).toBe('string');
    });

    it('should throw ConflictException when user with the same email already exists', async () => {
      (authService.signup as jest.Mock).mockRejectedValue(
        new ConflictException('User with this email already exists'),
      );

      await expect(authController.signup(validSignupDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should propagate service errors on signup', async () => {
      const serviceError = new Error('Service unavailable');
      (authService.signup as jest.Mock).mockRejectedValue(serviceError);

      await expect(authController.signup(validSignupDto)).rejects.toThrow(
        serviceError,
      );
    });
  });

  describe('login', () => {
    const validLoginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return user and access token when login is successful', async () => {
      (authService.login as jest.Mock).mockResolvedValue(mockAuthResponse);

      const result = await authController.login(validLoginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(result.user).not.toHaveProperty('password');
      expect(typeof result.access_token).toBe('string');
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(authController.login(validLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should propagate service errors on login', async () => {
      const serviceError = new Error('Database connection failed');
      (authService.login as jest.Mock).mockRejectedValue(serviceError);

      await expect(authController.login(validLoginDto)).rejects.toThrow(
        serviceError,
      );
    });
  });
});
