import { Request } from 'express';
import { UserResponseDto } from '../dto/api-response.dto';

export interface AuthenticatedRequest extends Request {
  user: UserResponseDto;
}
