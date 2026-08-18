import { createApiClient } from './api';
import { getCustomerToken } from './customerAuth';

// Storefront client — sends the customer session token, separate from the admin dashboard's.
export const customerApi = createApiClient(getCustomerToken);
