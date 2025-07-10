import { loginSchema, LoginInput } from '../../models/user.model';

export const LoginDto = loginSchema;
export type LoginDto = LoginInput;
