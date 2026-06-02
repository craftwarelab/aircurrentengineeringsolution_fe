import { useApiGet, useApiPost, useApiPut, useApiDelete } from '@/lib/hooks/use-api';

// Dynamic import for SWR mutation (same pattern as other service hooks)
let useSWRMutation: any = null;
try {
  const mutationModule = require('swr/mutation');
  useSWRMutation = mutationModule.default;
} catch (error) {
  console.warn('SWR not available. Please install axios and swr packages');
}

import api from '@/lib/api';

export interface CreateServiceRequest {
  name: string;
  slug: string;
  code?: string;
  price: number;
  sale_price?: number;
  description?: string;
  short_description?: string;
  status?: 'draft' | 'active' | 'inactive';
  is_featured?: boolean;
  seo_title?: string;
  seo_description?: string;
  meta_keywords?: string;
  category_ids?: number[];
  subcategory_ids?: number[];
  tag_ids?: number[];
  images?: any[];
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  code?: string;
  price: string | number;
  sale_price?: string | number;
  description?: string;
  short_description?: string;
  status: string;
  is_featured: boolean;
  seo_title?: string;
  seo_description?: string;
  meta_keywords?: string;
  created_at: string;
  updated_at: string;
  images?: any[];
  categories?: any[];
  subcategories?: any[];
  tags?: any[];
}

// Create service
export function useCreateService() {
  return useApiPost<Service>();
}

// Get all services with pagination (matches Postman /api/services?page=1&limit=10 response shape)
export interface ServicesResponse {
  success: boolean;
  data: {
    data: Service[];
    total: number;
    page: number;
    last_page: number;
  };
}

export function useServices(page: number = 1, limit: number = 10, status?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) params.append('status', status);

  const url = `${process.env.NEXT_PUBLIC_API_URL}/services?${params.toString()}`;
  return useApiGet<ServicesResponse>(url);
}

// Fetch all active services for public use (e.g. inquiry form)
export function useActiveServices() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/services?page=1&limit=100&status=active`;
  return useApiGet<Service[]>(url, {
    fetcher: async (u: string) => {
      const res = await api.get(u);
      const d = res.data?.data;
      // shape: { data: Service[], total, page, last_page }
      return Array.isArray(d) ? d : (d?.data ?? []);
    },
  });
}

// Update service
export function useUpdateService() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'update-service',
    async (key: string, { arg }: { arg: { serviceId: number; data: Partial<CreateServiceRequest> } }) => {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/services/${arg.serviceId}`, arg.data);
      return response.data as { success: boolean; message: string; data: Service };
    }
  );
}

// Delete service
export function useDeleteService() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'delete-service',
    async (key: string, { arg }: { arg: number }) => {
      const response = await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/services/${arg}`);
      return (response.data && response.data !== 'null') ? response.data : { message: 'Deleted successfully' };
    }
  );
}

// Service Image interface (for edit flows)
export interface ServiceImage {
  id: number;
  service_id: number;
  url: string;
  is_main: boolean;
  position: number;
  created_at?: string;
}
