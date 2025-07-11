import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { AuthenticatedRequest } from '../common/types/express.types';
import { UserWithoutPassword } from '../models/user.model';

describe('ProfileController', () => {
  let profileController: ProfileController;

  const mockUser: UserWithoutPassword = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
    }).compile();

    profileController = module.get<ProfileController>(ProfileController);
  });

  it('should be defined', () => {
    expect(profileController).toBeDefined();
  });

  describe('getProfile', () => {
    it("should return the user's profile from the request", () => {
      const mockRequest = { user: mockUser } as AuthenticatedRequest;
      const result = profileController.getProfile(mockRequest);
      expect(result).toEqual(mockUser);
    });

    it('should not include the password in the returned user profile', () => {
      const mockRequest = { user: mockUser } as AuthenticatedRequest;
      const result = profileController.getProfile(mockRequest);
      expect(result).not.toHaveProperty('password');
    });
  });
});
