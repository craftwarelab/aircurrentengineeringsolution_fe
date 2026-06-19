let useSWRMutation: any = null;

try {
  const mutationModule = require('swr/mutation');
  useSWRMutation = mutationModule.default;
} catch (error) {
  console.warn('SWR not available. Please install axios and swr packages: npm install axios swr');
}

import { useApiGet, useApiPost } from '@/lib/hooks/use-api';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// is_approved is NOT accepted on create — always false on creation per API docs.
// position is optional — auto-assigned if omitted.
export interface CreateTestimonialRequest {
  message: string;
  customer_name: string;
  customer_position?: string | null;
  company_name?: string | null;
  position?: number;
  status?: 'draft' | 'active' | 'inactive';
  is_active?: boolean;
}

export interface UpdateTestimonialRequest {
  message?: string;
  customer_name?: string;
  customer_position?: string | null;
  company_name?: string | null;
  position?: number;
  status?: 'draft' | 'active' | 'inactive';
  is_active?: boolean;
}

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
  data: Partial<Testimonial>;
}

export interface ApproveResponse {
  success: boolean;
  message: string;
  data: Partial<Testimonial>;
}

export interface PositionResponse {
  success: boolean;
  message: string;
  data: Partial<Testimonial>;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL;

// Admin — all testimonials
export function useTestimonials() {
  return useApiGet<Testimonial[]>(BASE ? `${BASE}/testimonials/` : null, {
    fetcher: async (url: string) => {
      const res = await api.get(url);
      const d = res.data?.data;
      return Array.isArray(d) ? d : [];
    },
    // Prevent SWR from auto-revalidating on window focus — that would
    // re-sort the list and cause rows to jump after approve/toggle actions
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
}

// Public — only visible testimonials (is_active + is_approved + status=active)
export function useVisibleTestimonials() {
  return useApiGet<Testimonial[]>(BASE ? `${BASE}/testimonials/visible` : null, {
    fetcher: async (url: string) => {
      const res = await api.get(url);
      const d = res.data?.data;
      return Array.isArray(d) ? d : [];
    },
  });
}

// Get by ID
export function useTestimonial(testimonialId: number | null) {
  return useApiGet<Testimonial>(
    testimonialId && BASE ? `${BASE}/testimonials/${testimonialId}` : null,
    {
      fetcher: async (url: string) => {
        const res = await api.get(url);
        return res.data?.data ?? null;
      },
    }
  );
}

// Create
export function useCreateTestimonial() {
  return useApiPost<Testimonial>();
}

// Update
export function useUpdateTestimonial() {
  if (!useSWRMutation) {
    return { trigger: () => Promise.reject(new Error('SWR not installed')), isMutating: false, error: null, data: null };
  }
  return useSWRMutation(
    'update-testimonial',
    async (_key: string, { arg }: { arg: { testimonialId: number; data: UpdateTestimonialRequest } }) => {
      const res = await api.put(`${BASE}/testimonials/${arg.testimonialId}`, arg.data);
      return res.data as TestimonialResponse;
    }
  );
}

// Delete
export function useDeleteTestimonial() {
  if (!useSWRMutation) {
    return { trigger: () => Promise.reject(new Error('SWR not installed')), isMutating: false, error: null, data: null };
  }
  return useSWRMutation(
    'delete-testimonial',
    async (_key: string, { arg }: { arg: string }) => {
      const res = await api.delete(`${BASE}/testimonials/${arg}`);
      return (res.data && res.data !== 'null') ? res.data : { message: 'Deleted successfully' };
    }
  );
}

// Approve
export function useApproveTestimonial() {
  if (!useSWRMutation) {
    return { trigger: () => Promise.reject(new Error('SWR not installed')), isMutating: false, error: null, data: null };
  }
  return useSWRMutation(
    'approve-testimonial',
    async (_key: string, { arg }: { arg: number }) => {
      const res = await api.patch(`${BASE}/testimonials/${arg}/approve`);
      return res.data as ApproveResponse;
    }
  );
}

// Unapprove
export function useUnapproveTestimonial() {
  if (!useSWRMutation) {
    return { trigger: () => Promise.reject(new Error('SWR not installed')), isMutating: false, error: null, data: null };
  }
  return useSWRMutation(
    'unapprove-testimonial',
    async (_key: string, { arg }: { arg: number }) => {
      const res = await api.patch(`${BASE}/testimonials/${arg}/unapprove`);
      return res.data as ApproveResponse;
    }
  );
}

// Toggle active
export function useToggleTestimonialActive() {
  if (!useSWRMutation) {
    return { trigger: () => Promise.reject(new Error('SWR not installed')), isMutating: false, error: null, data: null };
  }
  return useSWRMutation(
    'toggle-testimonial-active',
    async (_key: string, { arg }: { arg: number }) => {
      const res = await api.patch(`${BASE}/testimonials/${arg}/toggle-active`);
      return res.data as ToggleResponse;
    }
  );
}

// Update position
export function useUpdateTestimonialPosition() {
  if (!useSWRMutation) {
    return { trigger: () => Promise.reject(new Error('SWR not installed')), isMutating: false, error: null, data: null };
  }
  return useSWRMutation(
    'update-testimonial-position',
    async (_key: string, { arg }: { arg: { testimonialId: number; position: number } }) => {
      const res = await api.patch(`${BASE}/testimonials/${arg.testimonialId}/position`, { position: arg.position });
      return res.data as PositionResponse;
    }
  );
}
