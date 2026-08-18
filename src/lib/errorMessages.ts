import { ApiError } from './api';

// Centralized, user-friendly copy for every HTTP error case the API can return.
// Add new cases here rather than inlining messages in individual pages/forms.

type ErrorContext = 'login' | 'register' | 'upload' | 'newsletter' | 'default';

const STATUS_MESSAGES: Record<ErrorContext, Record<number, string>> = {
  login: {
    400: 'Please enter a valid email and password.',
    401: 'Incorrect email or password. Please try again.',
    403: 'This account does not have access to the dashboard.',
    404: 'No account was found with this email.',
    409: 'There’s a conflict with this account. Contact your admin.',
    422: 'Please check your email and password format.',
    429: 'Too many login attempts. Please wait a moment and try again.',
    500: 'Something went wrong on our end. Please try again shortly.',
    502: 'The server is temporarily unavailable. Please try again shortly.',
    503: 'The service is temporarily unavailable. Please try again shortly.',
    504: 'The server took too long to respond. Please try again.',
  },
  register: {
    400: 'Please check the information you entered.',
    401: 'You’re not authorized to do that.',
    403: 'You don’t have permission to create this account.',
    404: 'We couldn’t find that service. Please try again later.',
    409: 'An account with this email already exists.',
    422: 'Please check the information you entered.',
    429: 'Too many attempts. Please wait a moment and try again.',
    500: 'Something went wrong on our end. Please try again shortly.',
    502: 'The server is temporarily unavailable. Please try again shortly.',
    503: 'The service is temporarily unavailable. Please try again shortly.',
    504: 'The server took too long to respond. Please try again.',
  },
  upload: {
    400: 'That file type isn’t supported. Please use a JPEG, PNG, WEBP, or GIF image.',
    401: 'Your session has expired. Please sign in again.',
    403: 'You don’t have permission to upload this file.',
    413: 'Image is too large. Please use a smaller file.',
    415: 'That file type isn’t supported. Please use a JPEG, PNG, WEBP, or GIF image.',
    422: 'That file type isn’t supported. Please use a JPEG, PNG, WEBP, or GIF image.',
    429: 'Too many uploads. Please wait a moment and try again.',
    500: 'Something went wrong on our end. Please try again shortly.',
    502: 'The server is temporarily unavailable. Please try again shortly.',
    503: 'The service is temporarily unavailable. Please try again shortly.',
    504: 'The server took too long to respond. Please try again.',
  },
  newsletter: {
    400: 'Please enter a valid email address.',
    409: 'You’re already subscribed with this email.',
    422: 'Please enter a valid email address.',
    429: 'Too many attempts. Please wait a moment and try again.',
    500: 'Something went wrong on our end. Please try again shortly.',
    502: 'The server is temporarily unavailable. Please try again shortly.',
    503: 'The service is temporarily unavailable. Please try again shortly.',
    504: 'The server took too long to respond. Please try again.',
  },
  default: {
    400: 'That request wasn’t valid. Please check your input and try again.',
    401: 'Your session has expired. Please sign in again.',
    403: 'You don’t have permission to do that.',
    404: 'We couldn’t find what you were looking for.',
    409: 'This conflicts with existing data.',
    422: 'Some of the information provided isn’t valid.',
    429: 'Too many requests. Please slow down and try again.',
    500: 'Something went wrong on our end. Please try again shortly.',
    502: 'The server is temporarily unavailable. Please try again shortly.',
    503: 'The service is temporarily unavailable. Please try again shortly.',
    504: 'The server took too long to respond. Please try again.',
  },
};

const NETWORK_ERROR_MESSAGE =
  'Can’t reach the server. Check your internet connection and try again.';
const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

/**
 * Turns any error thrown by the api client into a single, user-safe sentence.
 * Pass `context` to use copy tailored to a specific form (e.g. "login").
 */
export function getFriendlyErrorMessage(err: unknown, context: ErrorContext = 'default'): string {
  if (err instanceof ApiError) {
    const table = STATUS_MESSAGES[context] || STATUS_MESSAGES.default;
    return table[err.status] || STATUS_MESSAGES.default[err.status] || FALLBACK_MESSAGE;
  }

  // fetch() throws a plain TypeError when the network request itself fails
  // (server down, no connection, CORS block) — there's no HTTP status to key off.
  if (err instanceof TypeError) {
    return NETWORK_ERROR_MESSAGE;
  }

  return FALLBACK_MESSAGE;
}
