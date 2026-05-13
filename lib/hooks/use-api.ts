// Dynamic imports to handle missing swr package
let useSWR: any = null;
let useSWRMutation: any = null;

try {
  const swrModule = require('swr');
  const mutationModule = require('swr/mutation');
  useSWR = swrModule.default;
  useSWRMutation = mutationModule.default;
} catch (error) {
  console.warn('SWR not available. Please install axios and swr packages: npm install axios swr');
}

import api from '@/lib/api';

// Generic GET hook
export function useApiGet<T>(url: string | null, options?: any) {
  if (!useSWR) {
    return {
      data: null,
      error: new Error('SWR not installed'),
      isLoading: false,
      mutate: () => Promise.resolve(),
    };
  }

  return useSWR<T>(url, {
    ...options,
  });
}

// Generic POST hook
export function useApiPost<T>(url: string) {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    url,
    async (url: string, { arg }: { arg: any }) => {
      const response = await api.post(url, arg);
      return response.data as T;
    }
  );
}

// Generic PUT hook
export function useApiPut<T>(url: string) {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    url,
    async (url: string, { arg }: { arg: any }) => {
      const response = await api.put(url, arg);
      return response.data as T;
    }
  );
}

// Generic DELETE hook
export function useApiDelete<T>(url: string) {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    url,
    async (url: string, { arg }: { arg?: any }) => {
      const response = await api.delete(url, { data: arg });
      return response.data as T;
    }
  );
}

// Auth-specific hooks
export function useAuthUser() {
  return useApiGet('/auth/me', {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });
}

export function useLogin() {
  return useApiPost('/auth/login');
}

export function useLogout() {
  return useApiPost('/auth/logout');
}