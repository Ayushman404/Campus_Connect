export const API_URL = 'http://localhost:5000';

/**
 * Centralized fetch wrapper.
 * - Automatically prepends the API base URL.
 * - Does NOT set Content-Type when the body is FormData,
 *   so the browser can set the correct multipart boundary for file uploads.
 */
export async function apiFetch(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;

  const headers = isFormData
    ? { ...options.headers } // Let browser set Content-Type for FormData
    : { 'Content-Type': 'application/json', ...options.headers };

  const config = {
    ...options,
    headers,
  };

  const url = `${API_URL}${endpoint}`;
  return fetch(url, config);
}
