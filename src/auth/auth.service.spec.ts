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
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

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

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
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

    it('should create user and return user with access token', async () => {
      userService.createUser.mockResolvedValue(mockUserWithoutPassword);
      jwtService.signAsync.mockResolvedValue('mockAccessToken');

      const result = await authService.signup(signupDto);

      expect(userService.createUser.mock.calls[0]).toEqual([
        signupDto.email,
        signupDto.password,
      ]);
      expect(jwtService.signAsync.mock.calls[0]).toEqual([
        {
          sub: mockUserWithoutPassword.id,
          email: mockUserWithoutPassword.email,
        },
      ]);
      expect(result).toEqual({
        user: mockUserWithoutPassword,
        access_token: 'mockAccessToken',
      });
    });

    it('should throw ConflictException when user already exists', async () => {
      userService.createUser.mockRejectedValue(
        new Error('User with this email already exists'),
      );

      await expect(authService.signup(signupDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userService.createUser.mock.calls[0]).toEqual([
        signupDto.email,
        signupDto.password,
      ]);
    });

    it('should rethrow other errors from userService', async () => {
      const unexpectedError = new Error('Database connection failed');
      userService.createUser.mockRejectedValue(unexpectedError);

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

    it('should authenticate user and return user with access token', async () => {
      userService.findByEmail.mockResolvedValue(mockUserWithPassword);
      userService.validatePassword.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('mockAccessToken');

      const result = await authService.login(loginDto);

      expect(userService.findByEmail.mock.calls[0]).toEqual([loginDto.email]);
      expect(userService.validatePassword.mock.calls[0]).toEqual([
        loginDto.password,
        mockUserWithPassword.password,
      ]);
      expect(jwtService.signAsync.mock.calls[0]).toEqual([
        {
          sub: mockUserWithPassword.id,
          email: mockUserWithPassword.email,
        },
      ]);
      expect(result).toEqual({
        user: mockUserWithoutPassword,
        access_token: 'mockAccessToken',
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.findByEmail.mock.calls[0]).toEqual([loginDto.email]);
      expect(userService.validatePassword.mock.calls).toHaveLength(0);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      userService.findByEmail.mockResolvedValue(mockUserWithPassword);
      userService.validatePassword.mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.findByEmail.mock.calls[0]).toEqual([loginDto.email]);
      expect(userService.validatePassword.mock.calls[0]).toEqual([
        loginDto.password,
        mockUserWithPassword.password,
      ]);
      expect(jwtService.signAsync.mock.calls).toHaveLength(0);
    });
  });

  describe('validateUser', () => {
    it('should return user without password when user exists', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      userService.findById.mockResolvedValue(mockUserWithoutPassword);

      const result = await authService.validateUser(userId);

      expect(userService.findById.mock.calls[0]).toEqual([userId]);
      expect(result).toEqual(mockUserWithoutPassword);
    });

    it('should return null when user does not exist', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      userService.findById.mockResolvedValue(null);

      const result = await authService.validateUser(userId);

      expect(userService.findById.mock.calls[0]).toEqual([userId]);
      expect(result).toBeNull();
    });
  });
});
