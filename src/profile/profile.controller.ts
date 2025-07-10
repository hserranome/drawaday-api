import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  UserResponseDto,
  ErrorResponseDto,
} from '../common/dto/api-response.dto';
import { AuthenticatedRequest } from '../common/types/express.types';

@ApiTags('profile')
@ApiBearerAuth('JWT-auth')
@Controller('profile')
export class ProfileController {
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Get user profile',
    description:
      'Retrieves the current authenticated user profile information.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  getProfile(@Request() req: AuthenticatedRequest): UserResponseDto {
    return req.user;
  }
}
