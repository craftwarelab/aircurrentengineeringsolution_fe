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
export interface FAQ {
  id: number;
  question: string;
  answer: string;
  priority: number;
  is_active: boolean;
  status: 'draft' | 'active' | 'inactive';
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFAQRequest {
  question: string;
  answer: string;
  priority: number;
  is_active: boolean;
  status: 'draft' | 'active' | 'inactive';
  slug: string;
}

export interface UpdateFAQRequest extends CreateFAQRequest {}

export interface FAQsResponse {
  success: boolean;
  data: FAQ[];
}

export interface FAQResponse {
  success: boolean;
  data: FAQ;
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

export interface PublishResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    is_active: boolean;
  };
}

export interface PriorityResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    priority: number;
  };
}

// Get all FAQs
export function useFAQs() {
  return useApiGet<FAQ[]>(process.env.NEXT_PUBLIC_API_URL+'/faqs/');
}

// Get visible FAQs (for frontend)
export function useVisibleFAQs() {
  return useApiGet<FAQ[]>(process.env.NEXT_PUBLIC_API_URL+'/faqs/visible');
}

// Get FAQ by ID
export function useFAQ(faqId: number | null) {
  return useApiGet<FAQ>(faqId ? process.env.NEXT_PUBLIC_API_URL+`/faqs/${faqId}` : null);
}

// Create FAQ
export function useCreateFAQ() {
  return useApiPost<FAQ>();
}

// Update FAQ
export function useUpdateFAQ() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'update-faq',
    async (key: string, { arg }: { arg: { faqId: number, data: UpdateFAQRequest } }) => {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/faqs/${arg.faqId}`, arg.data);
      return response.data as FAQResponse;
    }
  );
}

// Delete FAQ
export function useDeleteFAQ() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'delete-faq',
    async (key: string, { arg }: { arg: string }) => {
      const response = await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/faqs/${arg}`);
      // Handle cases where backend returns null or empty response
      return (response.data && response.data !== 'null') ? response.data : { message: 'Deleted successfully' };
    }
  );
}

// Toggle active status
export function useToggleFAQActive() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'toggle-faq-active',
    async (key: string, { arg }: { arg: number }) => {
      const response = await api.patch(`${process.env.NEXT_PUBLIC_API_URL}/faqs/${arg}/toggle-active`);
      return response.data as ToggleResponse;
    }
  );
}

// Publish FAQ
export function usePublishFAQ() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'publish-faq',
    async (key: string, { arg }: { arg: number }) => {
      const response = await api.patch(`${process.env.NEXT_PUBLIC_API_URL}/faqs/${arg}/publish`);
      return response.data as PublishResponse;
    }
  );
}

// Unpublish FAQ
export function useUnpublishFAQ() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'unpublish-faq',
    async (key: string, { arg }: { arg: number }) => {
      const response = await api.patch(`${process.env.NEXT_PUBLIC_API_URL}/faqs/${arg}/unpublish`);
      return response.data as PublishResponse;
    }
  );
}

// Update FAQ priority
export function useUpdateFAQPriority() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'update-faq-priority',
    async (key: string, { arg }: { arg: { faqId: number, priority: number } }) => {
      const response = await api.patch(`${process.env.NEXT_PUBLIC_API_URL}/faqs/${arg.faqId}/priority`, {
        priority: arg.priority
      });
      return response.data as PriorityResponse;
    }
  );
}