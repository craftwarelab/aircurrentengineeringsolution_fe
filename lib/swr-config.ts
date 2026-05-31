import { SWRConfig } from 'swr';
import api from './api';

export const swrConfig = {
  // Custom fetcher using our axios instance
  fetcher: (url: string) => api.get(url).then(res => res.data),

  // Global configuration
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 0, // Disable automatic refresh, use manual revalidation
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,

  // Loading states
  loadingTimeout: 3000,

  // Deduping interval (ms)
  dedupingInterval: 2000,

  // Focus revalidation
  revalidateOnFocus: false,
  revalidateOnMount: true,

  // Custom onError handler
  onError: (error: any, key: string) => {
    if (error.response?.status === 401) {
      // Already handled by axios interceptor
      return;
    }

    console.error(`SWR Error for ${key}:`, error);

    // You can add toast notifications here
    // toast.error('Failed to fetch data');
  },

  // Custom onSuccess handler (optional)
  onSuccess: (data: any, key: string) => {
    // Optional: Log successful requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`SWR Success for ${key}:`, data);
    }
  },
};