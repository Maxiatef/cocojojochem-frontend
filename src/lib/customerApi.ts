import { createApiClient } from './api';
import {
  clearCustomerToken,
  getCustomerRefreshToken,
  getCustomerToken,
  setCustomerTokensSilent,
} from './customerAuth';

// Storefront client — sends the customer session token, separate from the admin dashboard's.
// On an unrecoverable 401, clears storage (which already fires
// customer-auth-changed via clearCustomerToken so Header/AccountMenu update)
// and sends the shopper to sign back in.
export const customerApi = createApiClient({
  getAccessToken: getCustomerToken,
  getRefreshToken: getCustomerRefreshToken,
  setTokens: setCustomerTokensSilent,
  clearTokens: clearCustomerToken,
  onForceLogout: () => {
    if (typeof window !== 'undefined') window.location.href = '/account/login';
  },
});
