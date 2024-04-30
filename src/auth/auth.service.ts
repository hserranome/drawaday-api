import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: User['email'],
    pass: User['password'],
  ): Promise<User> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) return null;

    const isMatch = await compare(pass, user.password);
    if (!isMatch) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async generateAccessToken({ id, email }: User): Promise<string> {
    const payload = { email: email, sub: id };
    return this.jwtService.sign(payload);
  }

  async hashPassword(password: User['password']): Promise<string> {
    const saltRounds = 10; //@todo make constant
    return await hash(password, saltRounds);
  }
}
