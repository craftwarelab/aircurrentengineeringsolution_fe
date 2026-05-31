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
export interface ServiceSubcategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  position: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateSubcategoryRequest {
  name: string;
  slug: string;
  position: number;
  is_active: boolean;
}

export interface UpdateSubcategoryRequest extends CreateSubcategoryRequest {}

// Get subcategories by category ID
export function useServiceSubcategoriesByCategory(categoryId: number | null) {
  return useApiGet<ServiceSubcategory[]>(categoryId ? process.env.NEXT_PUBLIC_API_URL+`/services/categories/subcategories/category/${categoryId}` : null);
}

// Get subcategory by ID
export function useServiceSubcategory(subcategoryId: number | null) {
  return useApiGet<ServiceSubcategory>(subcategoryId ? process.env.NEXT_PUBLIC_API_URL+`/services/categories/subcategories/${subcategoryId}` : null);
}

// Get category by subcategory ID
export function useServiceCategoryBySubcategory(subcategoryId: number | null) {
  return useApiGet<any>(subcategoryId ? process.env.NEXT_PUBLIC_API_URL+`/services/categories/subcategories/${subcategoryId}/categories` : null);
}

// Create service subcategory under a specific category
export function useCreateServiceSubcategory() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'create-service-subcategory',
    async (key: string, { arg }: { arg: { categoryId: number, data: CreateSubcategoryRequest } }) => {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/services/categories/subcategories/category/${arg.categoryId}`, arg.data);
      return response.data as { success: boolean; message: string; data: ServiceSubcategory };
    }
  );
}

// Update service subcategory
export function useUpdateServiceSubcategory() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'update-service-subcategory',
    async (key: string, { arg }: { arg: { subcategoryId: number, data: UpdateSubcategoryRequest } }) => {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/services/categories/subcategories/${arg.subcategoryId}`, arg.data);
      return response.data as { success: boolean; message: string; data: ServiceSubcategory };
    }
  );
}

// Delete service subcategory
export function useDeleteServiceSubcategory() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'delete-service-subcategory',
    async (key: string, { arg }: { arg: string }) => {
      const response = await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/services/categories/subcategories/${arg}`);
      // Handle cases where backend returns null or empty response
      return (response.data && response.data !== 'null') ? response.data : { message: 'Deleted successfully' };
    }
  );
}