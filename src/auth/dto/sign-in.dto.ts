import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ minLength: 6, maxLength: 255, format: 'email' })
  email: string;

  @ApiProperty({ minLength: 6, maxLength: 255 })
  password: string;
}
