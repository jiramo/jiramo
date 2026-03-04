export type UserRole = 'user' | 'admin';

export interface User {
  ID: string;
  name: string;
  surname: string;
  email: string;
  role: UserRole;
}

export interface CreateUserInput {
  name: string;
  surname: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  surname?: string;
  email?: string;
  role?: UserRole;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}