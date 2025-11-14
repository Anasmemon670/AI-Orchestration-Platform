// API configuration for Django backend
import { getAccessToken, refreshAccessToken, verifyToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Get authorization headers with JWT token
 * Automatically refreshes token if expired
 */
const getAuthHeaders = async () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const accessToken = getAccessToken();
  
  if (accessToken) {
    // Verify token is still valid
    const verification = await verifyToken();
    
    if (!verification.valid) {
      // Try to refresh token
      const refreshResult = await refreshAccessToken();
      if (refreshResult.success) {
        headers['Authorization'] = `Bearer ${refreshResult.access}`;
      }
    } else {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  return headers;
};

/**
 * Make an authenticated GET request to the Django backend
 * @param {string} endpoint - API endpoint (e.g., '/projects/')
 * @param {boolean} requireAuth - Whether authentication is required (default: true)
 * @returns {Promise} Response data
 */
export const apiGet = async (endpoint, requireAuth = true) => {
  try {
    const headers = requireAuth ? await getAuthHeaders() : {
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 && requireAuth) {
        // Token might be expired, try refresh once
        const refreshResult = await refreshAccessToken();
        if (refreshResult.success) {
          // Retry with new token
          headers['Authorization'] = `Bearer ${refreshResult.access}`;
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers,
          });
          if (!retryResponse.ok) {
            // Try to get error message from response
            let errorMessage = `HTTP error! status: ${retryResponse.status}`;
            try {
              const errorData = await retryResponse.json();
              errorMessage = errorData.detail || errorData.message || errorMessage;
            } catch (e) {
              // Ignore JSON parse errors
            }
            throw new Error(errorMessage);
          }
          return await retryResponse.json();
        } else {
          // Refresh failed, throw authentication error
          throw new Error('Session expired. Please login again.');
        }
      }
      // Try to get error message from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Make an authenticated POST request to the Django backend
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body data
 * @param {boolean} requireAuth - Whether authentication is required (default: true)
 * @returns {Promise} Response data
 */
export const apiPost = async (endpoint, data, requireAuth = true) => {
  try {
    const headers = requireAuth ? await getAuthHeaders() : {
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401 && requireAuth) {
        // Token might be expired, try refresh once
        const refreshResult = await refreshAccessToken();
        if (refreshResult.success) {
          // Retry with new token
          headers['Authorization'] = `Bearer ${refreshResult.access}`;
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
          });
          if (!retryResponse.ok) {
            let errorMessage = `HTTP error! status: ${retryResponse.status}`;
            try {
              const errorData = await retryResponse.json();
              errorMessage = errorData.detail || errorData.message || errorMessage;
            } catch (e) {
              // Ignore JSON parse errors
            }
            throw new Error(errorMessage);
          }
          return await retryResponse.json();
        } else {
          throw new Error('Session expired. Please login again.');
        }
      }
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Make an authenticated PUT request to the Django backend
 */
export const apiPut = async (endpoint, data, requireAuth = true) => {
  try {
    const headers = requireAuth ? await getAuthHeaders() : {
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Make an authenticated PATCH request to the Django backend
 */
export const apiPatch = async (endpoint, data, requireAuth = true) => {
  try {
    const headers = requireAuth ? await getAuthHeaders() : {
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Make an authenticated DELETE request to the Django backend
 */
export const apiDelete = async (endpoint, requireAuth = true) => {
  try {
    const headers = requireAuth ? await getAuthHeaders() : {
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.status === 204 ? null : await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  baseURL: API_BASE_URL,
};

