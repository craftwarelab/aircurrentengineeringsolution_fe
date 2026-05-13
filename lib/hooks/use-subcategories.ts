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

// Types based on API documentation and existing types
export interface ProductSubcategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  position: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateSubcategoryRequest {
  category_id: number;
  name: string;
  slug: string;
  position: number;
  is_active: boolean;
}

export interface UpdateSubcategoryRequest extends CreateSubcategoryRequest {}

// Product interface for subcategory filtering
export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  status: string;
  is_featured: boolean;
  subcategory_id: number;
  images: any[];
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Get all subcategories
export function useSubcategories() {
  return useApiGet<ProductSubcategory[]>(process.env.NEXT_PUBLIC_API_URL+'/products/subcategories/all');
}

// Get subcategory by ID
export function useSubcategory(subcategoryId: number | null) {
  return useApiGet<ProductSubcategory>(subcategoryId ? process.env.NEXT_PUBLIC_API_URL+`/products/subcategories/${subcategoryId}` : null);
}

// Search subcategories
export function useSearchSubcategories(query: string) {
  return useApiGet<ProductSubcategory[]>(query ? process.env.NEXT_PUBLIC_API_URL+`/products/subcategories/filter/search?q=${encodeURIComponent(query)}` : null);
}

// Get subcategories by category ID
export function useSubcategoriesByCategory(categoryId: number | null) {
  return useApiGet<ProductSubcategory[]>(categoryId ? process.env.NEXT_PUBLIC_API_URL+`/products/subcategories/category/${categoryId}` : null);
}

// Get products by subcategory ID with pagination and filtering
export function useProductsBySubcategory(
  subcategoryId: number | null,
  page: number = 1,
  limit: number = 10,
  status?: string,
  featured?: boolean
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) params.append('status', status);
  if (featured !== undefined) params.append('featured', featured.toString());

  const url = subcategoryId
    ? `${process.env.NEXT_PUBLIC_API_URL}/products/subcategory/${subcategoryId}?${params.toString()}`
    : null;

  return useApiGet<ProductsResponse>(url);
}

// Create subcategory under a specific category
export function useCreateSubcategory() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'create-subcategory',
    async (key: string, { arg }: { arg: { categoryId: number, data: CreateSubcategoryRequest } }) => {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/products/categories/subcategories/category/${arg.categoryId}`, arg.data);
      return response.data as ProductSubcategory;
    }
  );
}

// Update subcategory
export function useUpdateSubcategory() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'update-subcategory',
    async (key: string, { arg }: { arg: { subcategoryId: number, data: UpdateSubcategoryRequest } }) => {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/products/categories/subcategories/${arg.subcategoryId}`, arg.data);
      return response.data as ProductSubcategory;
    }
  );
}

// Delete subcategory
export function useDeleteSubcategory() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'delete-subcategory',
    async (key: string, { arg }: { arg: string }) => {
      const response = await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/products/categories/subcategories/${arg}`);
      // Handle cases where backend returns null or empty response
      return (response.data && response.data !== 'null') ? response.data : { message: 'Deleted successfully' };
    }
  );
}