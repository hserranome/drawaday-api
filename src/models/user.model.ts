import { z } from 'zod';
import { User as UserEntity } from '../entities/user.entity';

// Type based on MikroORM entity
export type User = UserEntity;
export type NewUser = Omit<User, 'createdAt'>;

// Base schemas for reusability
const baseUserFields = {
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
};

const baseUserFieldsWithId = {
  id: z.string().uuid(),
  ...baseUserFields,
};

// Zod schemas for validation
export const insertUserSchema = z.object({
  ...baseUserFieldsWithId,
});

export const selectUserSchema = z.object({
  ...baseUserFieldsWithId,
  createdAt: z.date(),
});

export const updateUserSchema = z
  .object({
    id: z.string().uuid().optional(),
    email: z.string().email('Invalid email format').optional(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .optional(),
    createdAt: z.date().optional(),
  })
  .partial();

// Utility types
export type UserWithoutPassword = Omit<User, 'password'>;
export type UserResponse = UserWithoutPassword;
