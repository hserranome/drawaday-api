import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/sqlite';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
}));

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<EntityRepository<User>>;
  let entityManager: jest.Mocked<EntityManager>;

  const mockDate = new Date('2023-01-01T00:00:00.000Z');
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockEmail = 'test@example.com';
  const mockPassword = 'password123';
  const mockHashedPassword = 'hashedPassword123';

  const mockUser: User = {
    id: mockUserId,
    email: mockEmail,
    password: mockHashedPassword,
    createdAt: mockDate,
  } as User;

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
    };

    const mockEntityManager = {
      persistAndFlush: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
    entityManager = module.get(EntityManager);

    // Reset mocks
    jest.clearAllMocks();
    (mockBcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  describe('createUser', () => {
    it('should create user successfully when email is unique', async () => {
      userRepository.findOne.mockResolvedValue(null);
      entityManager.persistAndFlush.mockResolvedValue(undefined);

      const result = await userService.createUser(mockEmail, mockPassword);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        email: mockEmail,
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith(mockPassword, 10);
      expect(entityManager.persistAndFlush).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUserId,
          email: mockEmail,
          password: mockHashedPassword,
        }),
      );
      expect(result).toEqual({
        id: mockUserId,
        email: mockEmail,
        createdAt: expect.any(Date),
      });
    });

    it('should throw error when user already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        userService.createUser(mockEmail, mockPassword),
      ).rejects.toThrow('User with this email already exists');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        email: mockEmail,
      });
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(entityManager.persistAndFlush).not.toHaveBeenCalled();
    });

    it('should hash password with correct salt rounds', async () => {
      userRepository.findOne.mockResolvedValue(null);
      entityManager.persistAndFlush.mockResolvedValue(undefined);

      await userService.createUser(mockEmail, mockPassword);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(mockPassword, 10);
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await userService.findByEmail(mockEmail);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        email: mockEmail,
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await userService.findByEmail(mockEmail);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        email: mockEmail,
      });
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user without password when found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await userService.findById(mockUserId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        id: mockUserId,
      });
      expect(result).toEqual({
        id: mockUserId,
        email: mockEmail,
        createdAt: mockDate,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should return null when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await userService.findById(mockUserId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        id: mockUserId,
      });
      expect(result).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('should return true when password is valid', async () => {
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await userService.validatePassword(
        mockPassword,
        mockHashedPassword,
      );

      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        mockPassword,
        mockHashedPassword,
      );
      expect(result).toBe(true);
    });

    it('should return false when password is invalid', async () => {
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await userService.validatePassword(
        'wrongPassword',
        mockHashedPassword,
      );

      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'wrongPassword',
        mockHashedPassword,
      );
      expect(result).toBe(false);
    });
  });
});
