import { useApiGet, useApiPost, useApiPut, useApiDelete } from '@/lib/hooks/use-api';

// Types based on API documentation
export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  position: number;
  is_active: boolean;
  created_at: string;
  subcategories?: ProductSubcategory[];
}

export interface ProductSubcategory {
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

// Get all categories
export function useCategories() {
  return useApiGet<ProductCategory[]>(process.env.NEXT_PUBLIC_API_URL+'/products/categories/all');
}

// Get category by ID
export function useCategory(categoryId: number | null) {
  return useApiGet<ProductCategory>(categoryId ? process.env.NEXT_PUBLIC_API_URL+`/products/categories/${categoryId}` : null);
}

// Search categories
export function useSearchCategories(query: string) {
  return useApiGet<ProductCategory[]>(query ? process.env.NEXT_PUBLIC_API_URL+`/products/categories/filter/search?q=${encodeURIComponent(query)}` : null);
}

// Get category tree (with subcategories)
export function useCategoryTree() {
  return useApiGet<ProductCategory[]>(process.env.NEXT_PUBLIC_API_URL+'/products/categories/filter/tree');
}

// Create category
export function useCreateCategory() {
  return useApiPost<ProductCategory>();
}

// Update category
export function useUpdateCategory() {
  return useApiPut<ProductCategory>();
}

// Delete category
export function useDeleteCategory() {
  return useApiDelete<ProductCategory>();
}

// Get category by subcategory ID
export function useCategoryBySubcategory(subcategoryId: number | null) {
  return useApiGet<ProductCategory>(subcategoryId ? process.env.NEXT_PUBLIC_API_URL+`/products/categories/subcategory/${subcategoryId}` : null);
}