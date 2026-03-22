import type { User, UsersResponse, CreateUserInput, UpdateUserInput } from '../types/user';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Errore ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch { /* ignore parse errors */ }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const userService = {
  async getUsers(page = 1, limit = 50): Promise<UsersResponse> {
    const res = await fetch(`/users?page=${page}&limit=${limit}`, {
      headers: authHeaders(),
    });
    return handleResponse<UsersResponse>(res);
  },

  async getUserById(id: string): Promise<User> {
    const res = await fetch(`/users/${id}`, { headers: authHeaders() });
    return handleResponse<User>(res);
  },

  async createUser(input: CreateUserInput): Promise<User> {
    const res = await fetch('/users', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(input),
    });
    return handleResponse<User>(res);
  },

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const res = await fetch(`/users/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(input),
    });
    return handleResponse<User>(res);
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      let msg = `Errore ${res.status}`;
      try {
        const body = await res.json();
        if (body?.error) msg = body.error;
      } catch { /* ignore parse errors */ }
      throw new Error(msg);
    }
  },
};