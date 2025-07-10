import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'User password (minimum 1 character)',
    example: 'password123',
    type: String,
    minLength: 1,
  })
  password: string;
}

export class SignupRequestDto {
  @ApiProperty({
    description: 'User email address (must be valid email format)',
    example: 'user@example.com',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123',
    type: String,
    minLength: 6,
  })
  password: string;
}
