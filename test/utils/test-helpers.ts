import { INestApplication } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { User } from '../../src/entities/user.entity';
import { UserWithoutPassword } from '../../src/models/user.model';
import { UserService } from '../../src/user/user.service';

interface TestUser {
  email: string;
  password: string;
}

/**
 * Sample test data
 */
export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'password123',
  },
  anotherUser: {
    email: 'another@example.com',
    password: 'anotherpassword123',
  },
  invalidEmailUser: {
    email: 'invalid-email',
    password: 'password123',
  },
  shortPasswordUser: {
    email: 'test@example.com',
    password: '123',
  },
};

/**
 * Database setup and teardown helpers
 */
export class TestDatabase {
  private app: INestApplication;
  private orm: MikroORM;

  constructor(app: INestApplication) {
    this.app = app;
    this.orm = app.get(MikroORM);
  }

  async cleanup(): Promise<void> {
    await this.orm.em.fork().nativeDelete(User, {});
  }

  async createUser(userData: TestUser): Promise<UserWithoutPassword> {
    const userService = this.app.get(UserService);
    return await userService.createUser(userData.email, userData.password);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.orm.em.fork().findOne(User, { email });
  }

  async getUserCount(): Promise<number> {
    return await this.orm.em.fork().count(User, {});
  }
}
