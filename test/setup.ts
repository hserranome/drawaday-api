import { INestApplication } from '@nestjs/common';
import { cleanupDatabase } from './utils/test-helpers';

// Global test setup
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveUserStructure(): R;
      toHaveValidationError(field: string, message: string): R;
    }
  }
}

// Custom Jest matchers for better test assertions
expect.extend({
  toHaveUserStructure(received) {
    const pass =
      received &&
      typeof received === 'object' &&
      typeof received.id === 'string' &&
      typeof received.email === 'string' &&
      received.createdAt instanceof Date &&
      !received.hasOwnProperty('password');

    if (pass) {
      return {
        message: () => `Expected ${received} not to have user structure`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Expected ${received} to have user structure (id, email, createdAt, no password)`,
        pass: false,
      };
    }
  },

  toHaveValidationError(received, field: string, message: string) {
    const pass =
      received &&
      received.body &&
      received.body.message === 'Validation failed' &&
      received.body.errors &&
      received.body.errors.some(
        (error: any) => error.field === field && error.message === message,
      );

    if (pass) {
      return {
        message: () =>
          `Expected ${received} not to have validation error for ${field}: ${message}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Expected ${received} to have validation error for ${field}: ${message}`,
        pass: false,
      };
    }
  },
});

// Global test utilities
global.afterEach = global.afterEach || (() => {});

// Add any global test configuration here
export const testConfig = {
  timeout: 30000,
  verbose: false,
};

// Export for use in other test files
export { cleanupDatabase };
