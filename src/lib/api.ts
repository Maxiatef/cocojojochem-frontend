import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function createApiClient(getAuthToken: () => string | null) {
  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: res.statusText }));
      const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      throw new ApiError(res.status, message || 'Request failed');
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    patch: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  };
}

// Admin dashboard client — sends the admin session token.
export const api = createApiClient(getToken);
