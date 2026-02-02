export const SECURITY = {
  IDLE_TIMEOUT_MS: 10 * 60 * 1000,     // logout after this much inactivity
  WARNING_BEFORE_MS: 60 * 1000,        // show modal this long before logout
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_MS: 2 * 60 * 1000,           // lock duration after failed attempts
};