import { BadRequestException } from '@nestjs/common';
import { ZodValidationPipe } from './zod-validation.pipe';
import { z } from 'zod';

describe('ZodValidationPipe', () => {
  const testSchema = z.object({
    email: z.email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    age: z.number().optional(),
  });

  let pipe: ZodValidationPipe;

  beforeEach(() => {
    pipe = new ZodValidationPipe(testSchema);
  });

  describe('transform', () => {
    it('should return the parsed value when the data is valid', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        age: 25,
      };

      const result = pipe.transform(validData);

      expect(result).toEqual(validData);
    });

    it('should return the parsed value when the data is valid and optional fields are missing', () => {
      const validDataWithoutOptional = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = pipe.transform(validDataWithoutOptional);

      expect(result).toEqual(validDataWithoutOptional);
    });

    it('should throw a BadRequestException when the data type is invalid', () => {
      const dataWithStringAge = {
        email: 'test@example.com',
        password: 'password123',
        age: '25',
      };

      // This will fail because age should be a number
      expect(() => pipe.transform(dataWithStringAge)).toThrow(
        BadRequestException,
      );
    });

    it('should throw a BadRequestException with a specific error format when the email is invalid', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      try {
        pipe.transform(invalidData);
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect((error as BadRequestException).getResponse()).toEqual({
          message: 'Validation failed',
          errors: [
            {
              field: 'email',
              message: 'Invalid email format',
            },
          ],
        });
      }
    });

    it('should throw a BadRequestException with a specific error format when the password is too short', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '12345',
      };

      try {
        pipe.transform(invalidData);
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect((error as BadRequestException).getResponse()).toEqual({
          message: 'Validation failed',
          errors: [
            {
              field: 'password',
              message: 'Password must be at least 6 characters',
            },
          ],
        });
      }
    });

    it('should throw a BadRequestException with multiple errors when multiple fields are invalid', () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
      };

      try {
        pipe.transform(invalidData);
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect((error as BadRequestException).getResponse()).toEqual({
          message: 'Validation failed',
          errors: [
            {
              field: 'email',
              message: 'Invalid email format',
            },
            {
              field: 'password',
              message: 'Password must be at least 6 characters',
            },
          ],
        });
      }
    });

    it('should throw a BadRequestException when a required field is missing', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      try {
        pipe.transform(invalidData);
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect((error as BadRequestException).getResponse()).toEqual({
          message: 'Validation failed',
          errors: [
            {
              field: 'password',
              message: 'Invalid input: expected string, received undefined',
            },
          ],
        });
      }
    });

    it('should correctly handle nested field paths in the error response', () => {
      const nestedSchema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(1, 'Name is required'),
          }),
        }),
      });

      const nestedPipe = new ZodValidationPipe(nestedSchema);
      const invalidNestedData = {
        user: {
          profile: {
            name: '',
          },
        },
      };

      try {
        nestedPipe.transform(invalidNestedData);
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect((error as BadRequestException).getResponse()).toEqual({
          message: 'Validation failed',
          errors: [
            {
              field: 'user.profile.name',
              message: 'Name is required',
            },
          ],
        });
      }
    });

    it('should throw a generic BadRequestException when a non-ZodError is thrown', () => {
      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error('Some other error');
        }),
      } as unknown as z.ZodSchema;

      const pipeWithMockSchema = new ZodValidationPipe(mockSchema);

      expect(() => pipeWithMockSchema.transform({})).toThrow(
        new BadRequestException('Validation failed'),
      );
    });
  });
});
