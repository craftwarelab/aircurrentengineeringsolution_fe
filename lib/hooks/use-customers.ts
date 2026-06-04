import { useApiGet } from '@/lib/hooks/use-api';
import api from '@/lib/api';

let useSWRMutation: any = null;
try {
  const mutationModule = require('swr/mutation');
  useSWRMutation = mutationModule.default;
} catch {
  console.warn('SWR not available.');
}

export interface Customer {
  id: number;
  company_name: string;
  logo_public_id: string;
  short_description?: string;
  slug?: string;
  position: number;
  is_active: boolean;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CustomersListResponse {
  success: boolean;
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}

export function useCustomers(page = 1, limit = 10, search?: string, is_active?: boolean, is_featured?: boolean) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  if (is_active !== undefined) params.append('is_active', String(is_active));
  if (is_featured !== undefined) params.append('is_featured', String(is_featured));
  // Use a custom fetcher to preserve the full pagination response
  // (the global SWR fetcher strips the wrapper and loses total/last_page)
  return useApiGet<CustomersListResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/customers?${params}`,
    {
      fetcher: (url: string) => api.get(url).then((res: any) => res.data),
    }
  );
}

export function useFeaturedCustomers(limit = 20) {
  return useApiGet<CustomersListResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/customers/featured?page=1&limit=${limit}`,
    {
      fetcher: (url: string) => api.get(url).then((res: any) => res.data),
    }
  );
}

export function useCustomer(id: number | null) {
  return useApiGet<{ success: boolean; data: Customer }>(
    id ? `${process.env.NEXT_PUBLIC_API_URL}/customers/${id}` : null
  );
}

const swrFallback = () => ({
  trigger: () => Promise.reject(new Error('SWR not installed')),
  isMutating: false,
  error: null,
  data: null,
});

export function useCreateCustomer() {
  if (!useSWRMutation) return swrFallback();
  return useSWRMutation('create-customer', async (_: string, { arg }: { arg: FormData }) => {
    const res = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/customers`, arg, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  });
}

export function useUpdateCustomer() {
  if (!useSWRMutation) return swrFallback();
  return useSWRMutation('update-customer', async (_: string, { arg }: { arg: { id: number; data: FormData } }) => {
    const res = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/customers/${arg.id}`, arg.data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  });
}

export function useDeleteCustomer() {
  if (!useSWRMutation) return swrFallback();
  return useSWRMutation('delete-customer', async (_: string, { arg }: { arg: number }) => {
    const res = await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/customers/${arg}`);
    return res.data;
  });
}

export function useToggleCustomerActive() {
  if (!useSWRMutation) return swrFallback();
  return useSWRMutation('toggle-customer-active', async (_: string, { arg }: { arg: number }) => {
    const res = await api.patch(`${process.env.NEXT_PUBLIC_API_URL}/customers/${arg}/toggle-active`);
    return res.data;
  });
}

export function useToggleCustomerFeatured() {
  if (!useSWRMutation) return swrFallback();
  return useSWRMutation('toggle-customer-featured', async (_: string, { arg }: { arg: number }) => {
    const res = await api.patch(`${process.env.NEXT_PUBLIC_API_URL}/customers/${arg}/toggle-featured`);
    return res.data;
  });
}
