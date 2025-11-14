/**
 * Authentication service for JWT token management
 * Handles login, token storage, refresh, and validation
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

/**
 * Store tokens in localStorage
 */
export const setTokens = (accessToken, refreshToken, user = null) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Get user data from localStorage
 */
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Clear all tokens and user data
 */
export const clearAuth = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Check if user is authenticated (has valid access token)
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};

/**
 * Login with username/email and password
 * Returns { success: boolean, data?: { access, refresh, user }, error?: string }
 */
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, // Django SimpleJWT uses 'username' field
        password: password,
      }),
    });

    // Parse response only if it's ok, otherwise handle error
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // If response is not JSON, handle as network error
      if (!response.ok) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.',
        };
      }
      throw parseError;
    }

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        return {
          success: false,
          error: 'Invalid username or password. Please check your credentials.',
        };
      }
      return {
        success: false,
        error: data.detail || data.message || 'Authentication failed. Please try again.',
      };
    }

    // Extract tokens and user data from response
    // Custom serializer returns user data in the response
    const { access, refresh, user } = data;

    // Store tokens and user data
    setTokens(access, refresh, user || null);

    return {
      success: true,
      data: {
        access,
        refresh,
        user,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
};

/**
 * Refresh access token using refresh token
 * Returns { success: boolean, access?: string, error?: string }
 */
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return {
      success: false,
      error: 'No refresh token available',
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Refresh token is invalid, clear auth
      clearAuth();
      return {
        success: false,
        error: data.detail || 'Session expired. Please login again.',
      };
    }

    const { access } = data;

    // Update access token
    localStorage.setItem(ACCESS_TOKEN_KEY, access);

    return {
      success: true,
      access,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    clearAuth();
    return {
      success: false,
      error: 'Failed to refresh token. Please login again.',
    };
  }
};

/**
 * Verify if access token is still valid
 * Returns { valid: boolean }
 */
export const verifyToken = async () => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return { valid: false };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/token/verify/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: accessToken,
      }),
    });

    return { valid: response.ok };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false };
  }
};

/**
 * Get authorization header with access token
 * Automatically refreshes token if expired
 */
export const getAuthHeader = async () => {
  let accessToken = getAccessToken();

  if (!accessToken) {
    return null;
  }

  // Verify token is still valid
  const verification = await verifyToken();

  if (!verification.valid) {
    // Try to refresh
    const refreshResult = await refreshAccessToken();
    if (refreshResult.success) {
      accessToken = refreshResult.access;
    } else {
      return null;
    }
  }

  return {
    'Authorization': `Bearer ${accessToken}`,
  };
};

