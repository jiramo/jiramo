import { api } from '../lib/api';

export interface APIKey {
  id: string;
  project_id: string;
  label: string;
  trust_mode: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface CreateAPIKeyInput {
  label?: string;
  trust_mode?: boolean;
  expires_at?: string;
}

export interface CreateAPIKeyResponse {
  id: string;
  key: string;
  label: string;
  trust_mode: boolean;
  expires_at: string | null;
  created_at: string;
}

export const apiKeyService = {
  list(projectId: string) {
    return api.get<APIKey[]>(`/api/projects/${projectId}/apikeys`);
  },

  create(projectId: string, input: CreateAPIKeyInput) {
    return api.post<CreateAPIKeyResponse>(`/api/projects/${projectId}/apikeys`, input);
  },

  delete(projectId: string, keyId: string) {
    return api.delete<void>(`/api/projects/${projectId}/apikeys/${keyId}`);
  },
};
