import { useApiGet, useApiPost } from '@/lib/hooks/use-api';

export interface CreateProductRequest {
  name: string;
  slug: string;
  code?: string;
  sku?: string;
  model?: string;
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

export interface Product {
  id: number;
  name: string;
  slug: string;
  code?: string;
  sku?: string;
  model?: string;
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
  categories?: any[];
  subcategories?: any[];
  tags?: any[];
  stocks?: any[];
}

// Create product
export function useCreateProduct() {
  return useApiPost<Product>();
}

// Get all products with pagination
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

export function useProducts(page: number = 1, limit: number = 10, status?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (status) params.append('status', status);
  
  const url = `${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`;
  return useApiGet<ProductsResponse>(url);
}
