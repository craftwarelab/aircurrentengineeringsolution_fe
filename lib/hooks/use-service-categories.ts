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
export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  position: number;
  is_active: boolean;
  created_at: string;
  subcategories?: ServiceSubcategory[];
}

export interface ServiceSubcategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  position: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  position: number;
  is_active: boolean;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {}

// Get all service categories
export function useServiceCategories() {
  return useApiGet<ServiceCategory[]>(process.env.NEXT_PUBLIC_API_URL+'/services/categories/all');
}

// Get service category by ID
export function useServiceCategory(categoryId: number | null) {
  return useApiGet<ServiceCategory>(categoryId ? process.env.NEXT_PUBLIC_API_URL+`/services/categories/${categoryId}` : null);
}

// Search service categories
export function useSearchServiceCategories(query: string) {
  return useApiGet<ServiceCategory[]>(query ? process.env.NEXT_PUBLIC_API_URL+`/services/categories/filter/search?q=${encodeURIComponent(query)}` : null);
}

// Get service category tree (with subcategories)
export function useServiceCategoryTree() {
  return useApiGet<ServiceCategory[]>(process.env.NEXT_PUBLIC_API_URL+'/services/categories/filter/tree');
}

// Create service category
export function useCreateServiceCategory() {
  return useApiPost<ServiceCategory>();
}

// Update service category
export function useUpdateServiceCategory() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'update-service-category',
    async (key: string, { arg }: { arg: { categoryId: number, data: UpdateCategoryRequest } }) => {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/services/categories/${arg.categoryId}`, arg.data);
      return response.data as { success: boolean; message: string; data: ServiceCategory };
    }
  );
}

// Delete service category
export function useDeleteServiceCategory() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'delete-service-category',
    async (key: string, { arg }: { arg: string }) => {
      const response = await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/services/categories/${arg}`);
      // Handle cases where backend returns null or empty response
      return (response.data && response.data !== 'null') ? response.data : { message: 'Deleted successfully' };
    }
  );
}