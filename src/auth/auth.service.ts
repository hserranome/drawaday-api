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

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) return null;

    const isMatch = await compare(pass, user.password);
    if (!isMatch) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async generateAccessToken(user: User) {
    const payload = { email: user.email, sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  async hashPassword(password: string) {
    const saltRounds = 10; //@todo make constant
    return await hash(password, saltRounds);
  }
}
