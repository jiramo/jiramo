import { api } from '../lib/api';
import type { User } from '../types/user';

export interface UpdateProfileInput {
  name?: string;
  surname?: string;
  email?: string;
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
}

export const profileService = {
  getProfile() {
    return api.get<User>('/api/profile');
  },

  updateProfile(input: UpdateProfileInput) {
    return api.patch<User>('/api/profile', input);
  },

  deleteProfile() {
    return api.delete<void>('/api/profile');
  },

  changePassword(input: ChangePasswordInput) {
    return api.post<{ message: string }>('/api/profile/password', input);
  },
};
