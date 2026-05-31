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
export interface Testimonial {
  id: number;
  message: string;
  customer_name: string;
  customer_position: string | null;
  company_name: string | null;
  is_approved: boolean;
  is_active: boolean;
  position: number;
  status: 'draft' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateTestimonialRequest {
  message: string;
  customer_name: string;
  customer_position?: string;
  company_name?: string;
  status?: 'draft' | 'active' | 'inactive';
  is_active?: boolean;
  is_approved?: boolean;
}

export interface UpdateTestimonialRequest extends CreateTestimonialRequest {}

export interface TestimonialsResponse {
  success: boolean;
  data: Testimonial[];
}

export interface TestimonialResponse {
  success: boolean;
  data: Testimonial;
  message?: string;
}

export interface ToggleResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    is_active: boolean;
  };
}

export interface ApproveResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    is_approved: boolean;
  };
}

export interface PositionResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    position: number;
  };
}

// Get all testimonials
export function useTestimonials() {
  return useApiGet<Testimonial[]>(process.env.NEXT_PUBLIC_API_URL+'/testimonials/');
}

// Get visible testimonials (for frontend)
export function useVisibleTestimonials() {
  return useApiGet<Testimonial[]>(process.env.NEXT_PUBLIC_API_URL+'/testimonials/visible');
}

// Get testimonial by ID
export function useTestimonial(testimonialId: number | null) {
  return useApiGet<Testimonial>(testimonialId ? process.env.NEXT_PUBLIC_API_URL+`/testimonials/${testimonialId}` : null);
}

// Create testimonial
export function useCreateTestimonial() {
  return useApiPost<Testimonial>();
}

// Update testimonial
export function useUpdateTestimonial() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'update-testimonial',
    async (key: string, { arg }: { arg: { testimonialId: number, data: UpdateTestimonialRequest } }) => {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/testimonials/${arg.testimonialId}`, arg.data);
      return response.data as TestimonialResponse;
    }
  );
}

// Delete testimonial
export function useDeleteTestimonial() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'delete-testimonial',
    async (key: string, { arg }: { arg: string }) => {
      const response = await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/testimonials/${arg}`);
      // Handle cases where backend returns null or empty response
      return (response.data && response.data !== 'null') ? response.data : { message: 'Deleted successfully' };
    }
  );
}

// Approve testimonial
export function useApproveTestimonial() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'approve-testimonial',
    async (key: string, { arg }: { arg: number }) => {
      const response = await api.patch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials/${arg}/approve`);
      return response.data as ApproveResponse;
    }
  );
}

// Unapprove testimonial
export function useUnapproveTestimonial() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'unapprove-testimonial',
    async (key: string, { arg }: { arg: number }) => {
      const response = await api.patch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials/${arg}/unapprove`);
      return response.data as ApproveResponse;
    }
  );
}

// Toggle active status
export function useToggleTestimonialActive() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'toggle-testimonial-active',
    async (key: string, { arg }: { arg: number }) => {
      const response = await api.patch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials/${arg}/toggle-active`);
      return response.data as ToggleResponse;
    }
  );
}

// Update testimonial position
export function useUpdateTestimonialPosition() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'update-testimonial-position',
    async (key: string, { arg }: { arg: { testimonialId: number, position: number } }) => {
      const response = await api.patch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials/${arg.testimonialId}/position`, {
        position: arg.position
      });
      return response.data as PositionResponse;
    }
  );
}