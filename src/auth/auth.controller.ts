import {
  Controller,
  Post,
  Body,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  SignupRequestDto,
  LoginRequestDto,
} from '../common/dto/api-request.dto';
import {
  SignupResponseDto,
  LoginResponseDto,
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/dto/api-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(SignupDto))
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with email and password. Email must be unique.',
  })
  @ApiBody({
    type: SignupRequestDto,
    description: 'User registration data',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: SignupResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    type: ValidationErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'User with this email already exists',
    type: ErrorResponseDto,
  })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(LoginDto))
  @ApiOperation({
    summary: 'Authenticate user',
    description:
      'Authenticates user with email and password, returns JWT token.',
  })
  @ApiBody({
    type: LoginRequestDto,
    description: 'User login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    type: ValidationErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: ErrorResponseDto,
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
