import { Injectable } from '@nestjs/common';
import { User, UserWithoutPassword } from './user.interface';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  private users: User[] = []; // In-memory storage for demo purposes

  async createUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword> {
    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    this.users.push(newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async findById(id: string): Promise<UserWithoutPassword | undefined> {
    const user = this.users.find((user) => user.id === id);
    if (!user) return undefined;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
