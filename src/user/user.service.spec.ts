import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/better-sqlite';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let userService: UserService;
  let em: EntityManager;

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    const mockEm = {
      fork: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      persistAndFlush: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {}, // Not used directly anymore
        },
        {
          provide: EntityManager,
          useValue: mockEm,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    em = module.get(EntityManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user with a hashed password when the email is not in use', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);
      (em.persistAndFlush as jest.Mock).mockResolvedValue(undefined);

      const result = await userService.createUser(
        testUser.email,
        testUser.password,
      );

      expect(typeof result.id).toBe('string');
      expect(result.email).toBe(testUser.email);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result).not.toHaveProperty('password');
      expect(typeof result.id).toBe('string');
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('should throw an error when creating a user with an email that already exists', async () => {
      const existingUser = new User('id', 'test@example.com', 'pass');
      (em.findOne as jest.Mock).mockResolvedValue(existingUser);

      await expect(
        userService.createUser(testUser.email, testUser.password),
      ).rejects.toThrow('User with this email already exists');
    });

    it('should not persist the user when the email already exists', async () => {
      const existingUser = new User('id', 'test@example.com', 'pass');
      (em.findOne as jest.Mock).mockResolvedValue(existingUser);

      await expect(
        userService.createUser(testUser.email, testUser.password),
      ).rejects.toThrow();

      expect(em['persistAndFlush']).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return a user when a user with the given email exists', async () => {
      const mockUser = new User('id', 'test@example.com', 'pass');
      (em.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.findByEmail(testUser.email);

      expect(result).toEqual(mockUser);
    });

    it('should return null when a user with the given email does not exist', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      const result = await userService.findByEmail(testUser.email);

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user without the password when a user with the given ID exists', async () => {
      const mockUser = new User('id', 'test@example.com', 'pass');
      (em.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.findById('id');

      expect(result).not.toHaveProperty('password');
      expect(result?.email).toBe(mockUser.email);
    });

    it('should return null when a user with the given ID does not exist', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      const result = await userService.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('should return true when the password matches the hash', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      const result = await userService.validatePassword('pw', 'hash');
      expect(result).toBe(true);
    });

    it('should return false when the password does not match the hash', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      const result = await userService.validatePassword('pw', 'hash');
      expect(result).toBe(false);
    });

    it('should propagate errors from bcrypt comparison', async () => {
      const error = new Error('bcrypt error');
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => {
        throw error;
      });
      await expect(userService.validatePassword('pw', 'hash')).rejects.toThrow(
        error,
      );
    });
  });
});
