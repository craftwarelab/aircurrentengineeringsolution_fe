import useSWRMutation from 'swr/mutation';
import { useApiGet } from '@/lib/hooks/use-api';
import api from '@/lib/api';

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

export interface CreateInquiryRequest {
  full_name: string;
  email: string;
  phone_number: string;
  company_name?: string;
  project_location: string;
  expected_timeline?: string;
  estimated_budget?: string;
  service_types: string[];
  project_description: string;
}

export interface UpdateInquiryStatusRequest {
  status: Inquiry['status'];
  internal_notes?: string;
}

export interface UpdateInquiryRequest {
  full_name?: string;
  email?: string;
  phone_number?: string;
  company_name?: string | null;
  project_location?: string;
  expected_timeline?: string | null;
  estimated_budget?: string | null;
  service_types?: string[];
  project_description?: string;
  handled_by?: number | null;
  status?: Inquiry['status'];
  internal_notes?: string | null;
}

const BASE = process.env.NEXT_PUBLIC_API_URL;

export function useInquiries() {
  return useApiGet<Inquiry[]>(BASE ? `${BASE}/inquiries/` : null, {
    fetcher: async (url: string) => {
      const response = await api.get(url);
      const d = response.data.data;
      // Backend returns paginated: { results: [], total, page, pageSize }
      return Array.isArray(d) ? d : (d?.results ?? []);
    },
  });
}

export function useInquiry(id: number | null) {
  return useApiGet<Inquiry>(id && BASE ? `${BASE}/inquiries/${id}` : null, {
    fetcher: async (url: string) => {
      const response = await api.get(url);
      return response.data.data;
    },
  });
}

export function useUpdateInquiryStatus() {
  return useSWRMutation(
    'update-inquiry-status',
    async (_key: string, { arg }: { arg: { id: number; data: UpdateInquiryStatusRequest } }) => {
      const response = await api.patch(`${BASE}/inquiries/${arg.id}/status`, arg.data);
      return response.data;
    }
  );
}

export function useUpdateInquiry() {
  return useSWRMutation(
    'update-inquiry',
    async (_key: string, { arg }: { arg: { id: number; data: UpdateInquiryRequest } }) => {
      const response = await api.put(`${BASE}/inquiries/${arg.id}`, arg.data);
      return response.data;
    }
  );
}

export function useDeleteInquiry() {
  return useSWRMutation(
    'delete-inquiry',
    async (_key: string, { arg }: { arg: number }) => {
      const response = await api.delete(`${BASE}/inquiries/${arg}`);
      return response.data && response.data !== 'null' ? response.data : { message: 'Deleted successfully' };
    }
  );
}
