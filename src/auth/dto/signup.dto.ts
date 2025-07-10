import { signupSchema, SignupInput } from '../../models/user.model';

export const SignupDto = signupSchema;
export type SignupDto = SignupInput;
