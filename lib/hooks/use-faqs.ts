import useSWRMutation from 'swr/mutation';
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

// Paginated response from GET /api/faqs
export interface FAQsPagedResponse {
  success: boolean;
  data: FAQ[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}

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

// Get all FAQs — paginated, with optional filters & search
export function useFAQs(
  page: number = 1,
  limit: number = 10,
  options?: {
    status?: string;
    is_active?: boolean;
    search?: string;
  }
) {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    return useApiGet<FAQsPagedResponse>(null);
  }

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (options?.status)                          params.set('status',    options.status);
  if (options?.is_active !== undefined)         params.set('is_active', String(options.is_active));
  if (options?.search && options.search.trim()) params.set('search',    options.search.trim());

  const url = `${base}/faqs?${params.toString()}`;

  return useApiGet<FAQsPagedResponse>(url, {
    fetcher: async (u: string) => {
      const response = await api.get(u);
      // Response shape: { success, data: FAQ[], total, page, limit, last_page }
      return response.data as FAQsPagedResponse;
    },
  });
}

// Get visible FAQs (for frontend)
export function useVisibleFAQs() {
  return useApiGet<FAQ[]>(process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL + '/faqs/visible' : null, {
    fetcher: async (url: string) => {
      const response = await api.get(url);
      return response.data.data;
    }
  });
}

// Get FAQ by ID
export function useFAQ(faqId: number | null) {
  return useApiGet<FAQ>(faqId && process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL + `/faqs/${faqId}` : null, {
    fetcher: async (url: string) => {
      const response = await api.get(url);
      return response.data.data;
    }
  });
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