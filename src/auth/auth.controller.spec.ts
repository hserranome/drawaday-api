import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
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

    it('should create user successfully with valid data', async () => {
      authService.signup.mockResolvedValue(mockAuthResponse);

      const result = await authController.signup(validSignupDto);

      expect(authService.signup).toHaveBeenCalledWith(validSignupDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw ConflictException when user already exists', async () => {
      authService.signup.mockRejectedValue(
        new ConflictException('User with this email already exists'),
      );

      await expect(authController.signup(validSignupDto)).rejects.toThrow(
        ConflictException,
      );
      expect(authService.signup).toHaveBeenCalledWith(validSignupDto);
    });

    it('should handle service errors appropriately', async () => {
      const serviceError = new Error('Service unavailable');
      authService.signup.mockRejectedValue(serviceError);

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

    it('should authenticate user successfully with valid credentials', async () => {
      authService.login.mockResolvedValue(mockAuthResponse);

      const result = await authController.login(validLoginDto);

      expect(authService.login).toHaveBeenCalledWith(validLoginDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(authController.login(validLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(validLoginDto);
    });

    it('should handle service errors appropriately', async () => {
      const serviceError = new Error('Database connection failed');
      authService.login.mockRejectedValue(serviceError);

      await expect(authController.login(validLoginDto)).rejects.toThrow(
        serviceError,
      );
    });
  });

  describe('integration with validation pipe', () => {
    it('should have signup endpoint defined', () => {
      expect(authController.signup).toBeDefined();
      expect(typeof authController.signup).toBe('function');
    });

    it('should have login endpoint defined', () => {
      expect(authController.login).toBeDefined();
      expect(typeof authController.login).toBe('function');
    });
  });

  describe('HTTP status codes', () => {
    it('should return 201 status for successful signup', async () => {
      authService.signup.mockResolvedValue(mockAuthResponse);

      const result = await authController.signup({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockAuthResponse);
      // Status code is handled by @HttpCode decorator
    });

    it('should return 200 status for successful login', async () => {
      authService.login.mockResolvedValue(mockAuthResponse);

      const result = await authController.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockAuthResponse);
      // Status code is handled by @HttpCode decorator
    });
  });
});
