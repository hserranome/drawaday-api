import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @Get('me')
  findMe(): string {
    return 'This action returns me cats';
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  findAll(): string {
    return 'This action returns all cats';
  }
}
