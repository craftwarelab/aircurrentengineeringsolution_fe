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
export interface ProductTag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface CreateTagRequest {
  name: string;
}

export interface UpdateTagRequest {
  name: string;
}

export interface TagsResponse {
  success: boolean;
  data: ProductTag[];
  message?: string;
}

export interface TagResponse {
  success: boolean;
  data: ProductTag;
  message?: string;
}

export interface ProductsByTagResponse {
  success: boolean;
  data: any[]; // Product data structure
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Get all tags
export function useTags() {
  return useApiGet<ProductTag[]>(process.env.NEXT_PUBLIC_API_URL+'/products/tags/all');
}

// Get tag by ID
export function useTag(tagId: number | null) {
  return useApiGet<ProductTag>(tagId ? process.env.NEXT_PUBLIC_API_URL+`/products/tags/${tagId}` : null);
}

// Search tags
export function useSearchTags(query: string) {
  return useApiGet<ProductTag[]>(query ? process.env.NEXT_PUBLIC_API_URL+`/products/tags/search?q=${encodeURIComponent(query)}` : null);
}

// Get products by tag
export function useProductsByTag(
  tagId: number | null,
  page: number = 1,
  limit: number = 10
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const url = tagId
    ? `${process.env.NEXT_PUBLIC_API_URL}/products/tags/${tagId}/products?${params.toString()}`
    : null;

  return useApiGet<ProductsByTagResponse>(url);
}

// Create tags (accepts array of tag names)
export function useCreateTags() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'create-tags',
    async (key: string, { arg }: { arg: string[] }) => {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/products/tags`, arg);
      return response.data as TagsResponse;
    }
  );
}

// Update tag
export function useUpdateTag() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'update-tag',
    async (key: string, { arg }: { arg: { tagId: number, data: UpdateTagRequest } }) => {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/products/tags/${arg.tagId}`, arg.data);
      return response.data as TagResponse;
    }
  );
}

// Delete tag
export function useDeleteTag() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'delete-tag',
    async (key: string, { arg }: { arg: string }) => {
      const response = await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/products/tags/${arg}`);
      // Handle cases where backend returns null or empty response
      return (response.data && response.data !== 'null') ? response.data : { message: 'Deleted successfully' };
    }
  );
}