import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Body,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiConflictResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { UsersService } from 'src/users/users.service';
import { Public } from './public.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Body() _body: SignInDto, @Request() req) {
    return this.authService.generateAccessToken(req.user);
  }

  @Public()
  @ApiCreatedResponse({ description: 'User created' })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  @Post('signup')
  async signup(@Body() body: SignUpDto) {
    const user = await this.usersService.findOneByEmail(body.email);
    if (user) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.authService.hashPassword(body.password);

    const createdUser = await this.usersService.create({
      email: body.email,
      password: hashedPassword,
    });

    const { password, ...createdUserWithoutPassword } = createdUser;
    return createdUserWithoutPassword;
  }
}
