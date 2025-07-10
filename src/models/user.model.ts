import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from '../db/schema';
import { z } from 'zod';

// Drizzle-inferred types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Zod schemas generated from Drizzle schema
export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email('Invalid email format'),
  password: (schema) =>
    schema.min(6, 'Password must be at least 6 characters long'),
});

export const selectUserSchema = createSelectSchema(users);

export const updateUserSchema = createInsertSchema(users, {
  id: (schema) => schema.optional(),
  email: (schema) => schema.email('Invalid email format').optional(),
  password: (schema) =>
    schema.min(6, 'Password must be at least 6 characters long').optional(),
  createdAt: (schema) => schema.optional(),
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
