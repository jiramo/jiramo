import type { Project, CreateProjectInput, UpdateProjectInput } from '../types/project';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    let message = `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text);
      message = json.error || json.message || message;
    } catch {
      message = text || message;
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const projectService = {
  async getProjects(page = 1, limit = 50): Promise<Project[]> {
    const res = await fetch(`/projects?page=${page}&limit=${limit}`, {
      headers: authHeaders(),
    });
    return handleResponse<Project[]>(res);
  },

  async createProject(input: CreateProjectInput): Promise<Project> {
    const res = await fetch('/projects', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(input),
    });
    return handleResponse<Project>(res);
  },

  async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    const res = await fetch(`/projects/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(input),
    });
    return handleResponse<Project>(res);
  },

  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`/projects/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    await handleResponse<unknown>(res);
  },

  async toggleStatus(id: string): Promise<Project> {
    const res = await fetch(`/projects/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    return handleResponse<Project>(res);
  },
};