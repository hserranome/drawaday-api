import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UserWithoutPassword } from '../models/user.model';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserWithoutPassword: UserWithoutPassword = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    createdAt: new Date(),
  };

  const mockUserWithPassword = {
    ...mockUserWithoutPassword,
    password: 'hashedPassword123',
  };

  beforeEach(async () => {
    const mockUserService = {
      createUser: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      validatePassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  describe('signup', () => {
    const signupDto: SignupDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should create a user and return an authentication response when signup is successful', async () => {
      (userService.createUser as jest.Mock).mockResolvedValue(
        mockUserWithoutPassword,
      );
      (jwtService.signAsync as jest.Mock).mockResolvedValue('valid-jwt-token');

      const result = await authService.signup(signupDto);

      expect(result).toEqual({
        user: mockUserWithoutPassword,
        access_token: 'valid-jwt-token',
      });
      expect(result.user).not.toHaveProperty('password');
      expect(typeof result.access_token).toBe('string');
    });

    it('should throw ConflictException when a user with the same email already exists', async () => {
      (userService.createUser as jest.Mock).mockRejectedValue(
        new Error('User with this email already exists'),
      );

      await expect(authService.signup(signupDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should propagate unexpected errors when creating a user', async () => {
      const unexpectedError = new Error('Database connection failed');
      (userService.createUser as jest.Mock).mockRejectedValue(unexpectedError);

      await expect(authService.signup(signupDto)).rejects.toThrow(
        unexpectedError,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should authenticate a user and return an authentication response when login is successful', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(
        mockUserWithPassword,
      );
      (userService.validatePassword as jest.Mock).mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock).mockResolvedValue('valid-jwt-token');

      const result = await authService.login(loginDto);

      expect(result).toEqual({
        user: mockUserWithoutPassword,
        access_token: 'valid-jwt-token',
      });
      expect(result.user).not.toHaveProperty('password');
      expect(typeof result.access_token).toBe('string');
    });

    it('should throw UnauthorizedException when the user does not exist', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when the password is incorrect', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(
        mockUserWithPassword,
      );
      (userService.validatePassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should not attempt to validate the password if the user does not exist', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);
      const validatePasswordSpy = jest.spyOn(
        userService,
        'validatePassword',
      ) as jest.Mock;

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(validatePasswordSpy).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return user data when a user with a given ID exists', async () => {
      (userService.findById as jest.Mock).mockResolvedValue(
        mockUserWithoutPassword,
      );

      const result = await authService.validateUser(userId);

      expect(result).toEqual(mockUserWithoutPassword);
      expect(result).not.toHaveProperty('password');
    });

    it('should return null when a user with a given ID does not exist', async () => {
      (userService.findById as jest.Mock).mockResolvedValue(null);

      const result = await authService.validateUser(userId);

      expect(result).toBeNull();
    });
  });
});
