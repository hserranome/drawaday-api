export interface User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface UserWithoutPassword {
  id: string;
  email: string;
  createdAt: Date;
}
