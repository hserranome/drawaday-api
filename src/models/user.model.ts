import { z } from 'zod';
import { User as UserEntity } from '../entities/user.entity';

// Type based on MikroORM entity
export type User = UserEntity;
export type NewUser = Omit<User, 'createdAt'>;

// Zod schemas for validation
export const insertUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const selectUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string(),
  createdAt: z.date(),
});

export const updateUserSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  createdAt: z.date().optional(),
}).partial();

// Utility types
export type UserWithoutPassword = Omit<User, 'password'>;
export type UserResponse = UserWithoutPassword;

// Refined schemas for API validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
