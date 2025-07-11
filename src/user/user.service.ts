import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/better-sqlite';
import { User } from '../entities/user.entity';
import { UserWithoutPassword } from '../models/user.model';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
  ) {}

  async createUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword> {
    const em = this.em.fork();
    // Check if user already exists
    const existingUser = await em.findOne(User, { email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User(uuidv4(), email, hashedPassword);

    // Insert user into database
    await em.persistAndFlush(user);

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.em.fork().findOne(User, { email });
  }

  async findById(id: string): Promise<UserWithoutPassword | null> {
    const user = await this.em.fork().findOne(User, { id });

    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: __, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
