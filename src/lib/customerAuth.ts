// Separate token store from the admin dashboard's (lib/auth.ts) so an admin
// browsing the storefront doesn't collide sessions with their dashboard login.
const TOKEN_KEY = 'cocojojochem_customer_token';
const REFRESH_TOKEN_KEY = 'cocojojochem_customer_refresh_token';

export function getCustomerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCustomerRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setCustomerToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event('customer-auth-changed'));
}

// Stores both tokens together — every login/refresh issues a pair.
export function setCustomerTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  window.dispatchEvent(new Event('customer-auth-changed'));
}

// Silent variant used by the API client's background refresh — updates
// storage without dispatching customer-auth-changed, since nothing about the
// signed-in identity changed and re-rendering auth-dependent UI would be
// wasted work (and could cause a jarring flash on components that key off
// that event).
export function setCustomerTokensSilent(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearCustomerToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.dispatchEvent(new Event('customer-auth-changed'));
}

export function decodeCustomerToken(
  token: string,
): { sub: number; email: string; role: string } | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}
