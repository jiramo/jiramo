const BASE_URL = '';
const LOGOUT_FLAG = 'auth_logged_out';

interface ApiError extends Error {
  status: number;
}

type AuthInvalidHandler = () => void;

let authInvalidHandler: AuthInvalidHandler | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAuthInvalidHandler(handler: AuthInvalidHandler | null) {
  authInvalidHandler = handler;
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
    const error = new Error(message) as ApiError;
    error.status = res.status;
    throw error;
  }
  if (res.status === 204) {
    return null as T;
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return res.json() as Promise<T>;
  }

  const text = await res.text();
  if (!text) {
    return null as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

function isUnauthorizedError(err: unknown): boolean {
  return err instanceof Error && 'status' in err && (err as ApiError).status === 401;
}

function notifyAuthInvalid() {
  if (authInvalidHandler) authInvalidHandler();
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function refreshAccessToken(): Promise<string | null> {
  if (auth.isLoggedOut()) return null;
  if (refreshPromise) return refreshPromise;

  refreshPromise = auth
    .refresh()
    .then((data) => {
      auth.setTokens({ access_token: data.access_token });
      return data.access_token;
    })
    .catch((err) => {
      if (isUnauthorizedError(err)) {
        auth.clearTokens();
        notifyAuthInvalid();
        return null;
      }
      auth.clearTokens();
      notifyAuthInvalid();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function fetchJson<T>(path: string, init: RequestInit, options?: { auth?: boolean; retry?: boolean; credentials?: RequestCredentials }) {
  const useAuth = options?.auth !== false;
  const baseHeaders = useAuth ? authHeaders() : { 'Content-Type': 'application/json' };
  const headers = { ...baseHeaders, ...(init.headers as Record<string, string> | undefined) };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: options?.credentials ?? init.credentials,
  });

  if (useAuth && res.status === 401 && options?.retry !== false && !auth.isLoggedOut()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return fetchJson<T>(path, init, { ...options, retry: false });
    }
  }

  return handleResponse<T>(res);
}

export const api = {
  get: <T>(path: string) =>
    fetchJson<T>(path, { method: 'GET' }),

  post: <T>(path: string, body: unknown) =>
    fetchJson<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  patch: <T>(path: string, body?: unknown) =>
    fetchJson<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) =>
    fetchJson<T>(path, {
      method: 'DELETE',
    }),

  postNoAuth: <T>(path: string, body: unknown) =>
    fetchJson<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }, { auth: false }),

  postWithCredentials: <T>(path: string, body: unknown) =>
    fetchJson<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }, { auth: false, credentials: 'include' }),
};

export const auth = {
  login: (email: string, password: string) =>
    api.postNoAuth<{ access_token: string; refresh_token?: string }>('/api/auth/login', { email, password }),

  register: (data: { name: string; surname: string; email: string; password: string }) =>
    api.postNoAuth<{ id: string; name: string; surname: string; email: string; role: string }>('/api/auth/register', data),

  refresh: () =>
    api.postWithCredentials<{ access_token: string; expires_in: number }>('/api/auth/refresh', {}),

  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getToken: () => localStorage.getItem('access_token'),

  isLoggedOut: () => localStorage.getItem(LOGOUT_FLAG) === '1',

  markLoggedOut: () => localStorage.setItem(LOGOUT_FLAG, '1'),

  clearLoggedOut: () => localStorage.removeItem(LOGOUT_FLAG),

  logout: () => {
    auth.clearTokens();
    auth.markLoggedOut();
  },

  setTokens: (data: { access_token: string; refresh_token?: string }) => {
    localStorage.setItem('access_token', data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    auth.clearLoggedOut();
  },
};
