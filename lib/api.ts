let axios: any = null;

try {
  axios = require('axios');
} catch (error) {
  console.warn('Axios not available. Please install axios and swr packages: npm install axios swr');
}

import { AuthUtils } from './auth';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

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

  api.interceptors.request.use(
    (config: any) => {
      const token = AuthUtils.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const newToken = await AuthUtils.refreshAccessToken();
        isRefreshing = false;

        if (newToken) {
          onRefreshed(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }

        // Refresh failed — logout and redirect
        AuthUtils.logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      }

      if (error.response?.status >= 500) {
        console.error('Server error:', error.response.data);
      }

      return Promise.reject(error);
    }
  );
} else {
  api = {
    get: () => Promise.reject(new Error('Axios not installed')),
    post: () => Promise.reject(new Error('Axios not installed')),
    put: () => Promise.reject(new Error('Axios not installed')),
    delete: () => Promise.reject(new Error('Axios not installed')),
  };
}

export default api;
