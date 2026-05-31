// Dynamic imports to handle missing swr package
let useSWRMutation: any = null;

try {
  const mutationModule = require('swr/mutation');
  useSWRMutation = mutationModule.default;
} catch (error) {
  console.warn('SWR not available. Please install axios and swr packages: npm install axios swr');
}

import { useApiGet, useApiPost, useApiPut, useApiDelete } from '@/lib/hooks/use-api';
import api from '@/lib/api';

// Types based on API documentation
export interface ServiceTag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface UpdateServiceTagRequest {
  name: string;
  slug: string;
}

export interface TagsResponse {
  success: boolean;
  data: ServiceTag[];
  message?: string;
}

export interface TagResponse {
  success: boolean;
  data: ServiceTag;
  message?: string;
}

export interface ServicesByTagResponse {
  success: boolean;
  data: any[]; // Service data structure
};

// Get all service tags
export function useServiceTags() {
  return useApiGet<ServiceTag[]>(process.env.NEXT_PUBLIC_API_URL+'/services/tags/all');
}

// Get service tag by ID
export function useServiceTag(tagId: number | null) {
  return useApiGet<ServiceTag>(tagId ? process.env.NEXT_PUBLIC_API_URL+`/services/tags/${tagId}` : null);
}

// Search service tags
export function useSearchServiceTags(query: string) {
  return useApiGet<ServiceTag[]>(query ? process.env.NEXT_PUBLIC_API_URL+`/services/tags/filter/search?q=${encodeURIComponent(query)}` : null);
}

// Get services by service tag
export function useServicesByServiceTag(tagId: number | null) {
  const url = tagId
    ? `${process.env.NEXT_PUBLIC_API_URL}/services/tags/${tagId}/services`
    : null;

  return useApiGet<ServicesByTagResponse>(url);
}

// Create service tags (accepts array of tag names)
export function useCreateServiceTags() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'create-service-tags',
    async (key: string, { arg }: { arg: string[] }) => {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/services/tags`, arg);
      return response.data as TagsResponse;
    }
  );
}

// Update service tag
export function useUpdateServiceTag() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'update-service-tag',
    async (key: string, { arg }: { arg: { tagId: number, data: UpdateServiceTagRequest } }) => {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/services/tags/${arg.tagId}`, arg.data);
      return response.data as TagResponse;
    }
  );
}

// Delete service tag
export function useDeleteServiceTag() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'delete-service-tag',
    async (key: string, { arg }: { arg: string }) => {
      const response = await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/services/tags/${arg}`);
      // Handle cases where backend returns null or empty response
      return (response.data && response.data !== 'null') ? response.data : { message: 'Deleted successfully' };
    }
  );
}