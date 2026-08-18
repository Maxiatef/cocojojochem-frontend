const TOKEN_KEY = 'cocojojochem_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Decodes the JWT payload without verifying — verification happens server-side.
// Only used here to read role/email for UI display and route gating.
export function decodeToken(token: string): { sub: number; email: string; role: string } | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}
