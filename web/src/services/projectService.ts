import { api } from '../lib/api';
import type { Project, CreateProjectInput, UpdateProjectInput } from '../types/project';

export const projectService = {
  getProjects(page = 1, limit = 50) {
    return api.get<Project[]>(`/api/projects?page=${page}&limit=${limit}`);
  },

  createProject(input: CreateProjectInput) {
    return api.post<Project>('/api/projects', input);
  },

  updateProject(id: string, input: UpdateProjectInput) {
    return api.patch<Project>(`/api/projects/${id}`, input);
  },

  deleteProject(id: string) {
    return api.delete<void>(`/api/projects/${id}`);
  },

  toggleStatus(id: string) {
    return api.patch<Project>(`/api/projects/${id}/status/toggle`);
  },

  activateStatus(id: string) {
    return api.post<{ status: boolean; customer: { name: string; surname: string; email: string } }>(`/api/projects/${id}/status/set`, {});
  },

  getStatus(id: string) {
    return api.get<{ status: boolean; customer: { name: string; surname: string; email: string } }>(`/api/projects/${id}/status`);
  },
};
