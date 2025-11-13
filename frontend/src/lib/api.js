// API configuration for Django backend
const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Make a GET request to the Django backend
 * @param {string} endpoint - API endpoint (e.g., '/test/')
 * @returns {Promise} Response data
 */
export const apiGet = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Make a POST request to the Django backend
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body data
 * @returns {Promise} Response data
 */
export const apiPost = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default {
  get: apiGet,
  post: apiPost,
  baseURL: API_BASE_URL,
};

