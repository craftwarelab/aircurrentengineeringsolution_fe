// User types
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  mobile_number: string;
  country: string;
  email: string;
  role: 'user' | 'guest' | 'admin' | 'superAdmin' | 'manager' | 'employee';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Product Category types
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  position: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductSubcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  position: number;
  is_active: boolean;
  created_at: string;
}

// Product Tag type
export interface ProductTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// Service Category types
export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  position: number;
  is_active: boolean;
  created_at: string;
}

export interface ServiceSubcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  position: number;
  is_active: boolean;
  created_at: string;
}

// Service Tag type
export interface ServiceTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// Project Tag type
export interface ProjectTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  slug?: string;
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
  created_at: string;
  updated_at: string;
  // Relationship IDs for form handling
  category_ids?: string[];
  subcategory_ids?: string[];
  tags?: string[];
  images?: File[]; // For form handling
  // Relations (for display purposes)
  categories?: ProductCategory[];
  subcategories?: ProductSubcategory[];
  tag_objects?: ProductTag[];
  image_objects?: ProductImage[];
  stocks?: ProductStock[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  is_main: boolean;
  position: number;
  created_at: string;
}

export interface ProductStock {
  id: string;
  product_id: string;
  quantity: number;
  reserved_quantity: number;
  warehouse_id?: number;
  variant_id?: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

// Service types
export interface Service {
  id: string;
  name: string;
  slug?: string;
  code?: string;
  price?: number;
  sale_price?: number;
  description?: string;
  short_description?: string;
  status?: 'draft' | 'active' | 'inactive';
  is_featured?: boolean;
  seo_title?: string;
  seo_description?: string;
  meta_keywords?: string;
  created_at: string;
  updated_at: string;
  // Relationship IDs for form handling
  category_ids?: string[];
  subcategory_ids?: string[];
  tag_ids?: string[];
  images?: File[]; // For form handling
  main_image_index?: number;
  // Relations (for display purposes)
  categories?: ServiceCategory[];
  subcategories?: ServiceSubcategory[];
  tag_objects?: ServiceTag[];
  image_objects?: ServiceImage[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  position: number;
  is_active: boolean;
  created_at: string;
}

export interface ServiceSubcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  position: number;
  is_active: boolean;
  created_at: string;
}

export interface ServiceTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ServiceImage {
  id: string;
  service_id: string;
  url: string;
  is_main: boolean;
  position: number;
  created_at: string;
}

// Project types
export interface Project {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
  meta_keywords?: string;
  status?: 'draft' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  // Relationship IDs for form handling
  tag_ids?: string[];
  images?: File[]; // For form handling
  main_image_index?: number;
  // Relations (for display purposes)
  tag_objects?: ProjectTag[];
  image_objects?: ProjectImage[];
}

export interface ProjectTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  url: string;
  is_main: boolean;
  position: number;
  created_at: string;
}

// Customer Showcase
export interface CustomerShowcase {
  id: string;
  company_name: string;
  logo_url: string;
  customer_name?: string;
  customer_position?: string;
  description?: string;
  slug?: string;
  position: number;
  is_active: boolean;
  status: 'draft' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Testimonials
export interface Testimonial {
  id: string;
  message: string;
  customer_name: string;
  customer_position?: string;
  company_name?: string;
  is_approved: boolean;
  is_active: boolean;
  position: number;
  status: 'draft' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// FAQs
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  priority: number;
  is_active: boolean;
  status: 'draft' | 'active' | 'inactive';
  slug?: string;
  created_at: string;
  updated_at: string;
}

// Inquiries
export interface Inquiry {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  company_name: string | null;
  project_location: string;
  expected_timeline: string | null;
  estimated_budget: string | null;
  service_types: string[];
  project_description: string;
  status: 'new' | 'pending' | 'contacted' | 'in_progress' | 'completed' | 'cancelled';
  handled_by: number | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Legacy ContactInquiry for backward compatibility
export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'new' | 'read' | 'replied';
}
