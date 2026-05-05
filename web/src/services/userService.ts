import { api } from '../lib/api';
import type { User, UsersResponse, CreateUserInput, UpdateUserInput } from '../types/user';

export const userService = {
  getMe() {
    return api.get<User>('/api/users/me');
  },

  getUsers(page = 1, limit = 50) {
    return api.get<UsersResponse>(`/api/users?page=${page}&limit=${limit}`);
  },

  getUserById(id: string) {
    return api.get<User>(`/api/users/${id}`);
  },

  createUser(input: CreateUserInput) {
    return api.post<User>('/api/users', input);
  },

  updateUser(id: string, input: UpdateUserInput) {
    return api.patch<User>(`/api/users/${id}`, input);
  },

  deleteUser(id: string) {
    return api.delete<void>(`/api/users/${id}`);
  },
};
