// Separate token store from the admin dashboard's (lib/auth.ts) so an admin
// browsing the storefront doesn't collide sessions with their dashboard login.
const TOKEN_KEY = 'cocojojochem_customer_token';

export function getCustomerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setCustomerToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event('customer-auth-changed'));
}

export function clearCustomerToken() {
  localStorage.removeItem(TOKEN_KEY);
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
