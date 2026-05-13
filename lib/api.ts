// Dynamic import to handle missing axios package
let axios: any = null;

try {
  axios = require('axios');
} catch (error) {
  console.warn('Axios not available. Please install axios and swr packages: npm install axios swr');
}

import { AuthUtils } from './auth';

// Create axios instance with default config
let api: any = null;

if (axios) {
  api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    timeout: 10000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor for auth headers
  api.interceptors.request.use(
    (config: any) => {
      // Get token using AuthUtils
      const token = AuthUtils.getToken();

      if (token && !AuthUtils.isTokenExpired()) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (token && AuthUtils.isTokenExpired()) {
        // Token is expired, clear it
        AuthUtils.logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      }

      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for unauthorized handling
  api.interceptors.response.use(
    (response: any) => {
      return response;
    },
    (error: any) => {
      if (error.response?.status === 401) {
        // Unauthorized - clear auth data and redirect to login
        AuthUtils.logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      }

      // Handle token refresh if needed (optional)
      if (error.response?.status === 403 && error.response.data?.message === 'Token expired') {
        // Could implement token refresh logic here
        AuthUtils.logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      }

      // Handle other error statuses
      if (error.response?.status >= 500) {
        console.error('Server error:', error.response.data);
      }

      return Promise.reject(error);
    }
  );
} else {
  // Fallback API object for when axios is not available
  api = {
    get: () => Promise.reject(new Error('Axios not installed')),
    post: () => Promise.reject(new Error('Axios not installed')),
    put: () => Promise.reject(new Error('Axios not installed')),
    delete: () => Promise.reject(new Error('Axios not installed')),
  };
}

export default api;