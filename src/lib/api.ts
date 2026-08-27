import { clearToken, getRefreshToken, getToken, setTokens } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Endpoints that must never trigger a silent-refresh attempt on 401 — retrying
// them through the refresh flow would either be meaningless (refresh itself)
// or risk a refresh loop (login/register never return 401 for auth reasons
// that a refresh could fix).
const NO_REFRESH_PATHS = ['/auth/refresh', '/auth/login', '/auth/register'];

interface ApiClientConfig {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  onForceLogout: () => void;
}

export function createApiClient(config: ApiClientConfig) {
  const { getAccessToken, getRefreshToken, setTokens, clearTokens, onForceLogout } = config;

  // Module-instance-level in-flight refresh promise, so concurrent 401s from
  // several simultaneous requests share a single POST /auth/refresh call
  // instead of each racing to rotate the refresh token (which would make all
  // but one of them lose the race and force-logout the user).
  let refreshPromise: Promise<string | null> | null = null;

  async function doRefresh(): Promise<string | null> {
    const rawRefreshToken = getRefreshToken();
    if (!rawRefreshToken) return null;

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rawRefreshToken }),
      });
      if (!res.ok) return null;
      const body = await res.json();
      setTokens(body.accessToken, body.refreshToken);
      return body.accessToken as string;
    } catch {
      return null;
    }
  }

  function refreshOnce(): Promise<string | null> {
    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    return refreshPromise;
  }

  async function rawFetch(path: string, options: RequestInit, token: string | null) {
    return fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  }

  async function toApiError(res: Response): Promise<ApiError> {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    return new ApiError(res.status, message || 'Request failed');
  }

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getAccessToken();
    let res = await rawFetch(path, options, token);

    if (res.status === 401 && !NO_REFRESH_PATHS.some((p) => path.startsWith(p))) {
      const newAccessToken = await refreshOnce();
      if (newAccessToken) {
        res = await rawFetch(path, options, newAccessToken);
      } else {
        clearTokens();
        onForceLogout();
        throw await toApiError(res);
      }
    }

    if (!res.ok) {
      throw await toApiError(res);
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

// Admin dashboard client — sends the admin session token. On an unrecoverable
// 401 (no refresh token, or the refresh call itself fails), redirects to the
// admin login screen.
export const api = createApiClient({
  getAccessToken: getToken,
  getRefreshToken,
  setTokens,
  clearTokens: clearToken,
  onForceLogout: () => {
    if (typeof window !== 'undefined') window.location.href = '/admin/login';
  },
});
