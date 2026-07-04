import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { AuthUtils } from '@/lib/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'superAdmin' | 'admin' | 'manager' | 'employee' | 'user' | 'guest';
  is_active: boolean;
  mobile_number?: string;
  country?: string;
  address_line_1?: string;
  address_line_2?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsersListResponse {
  success: boolean;
  data: {
    users: AdminUser[];
    pagination: { total: number; limit: number; offset: number; hasMore: boolean };
  };
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  mobile_number: string;
  country: string;
  address_line_1: string;
  address_line_2?: string;
  role?: 'guest' | 'user' | 'employee' | 'manager' | 'admin';
  is_active?: boolean;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile_number?: string;
  country?: string;
  address_line_1?: string;
  address_line_2?: string | null;
  role?: string;
  is_active?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Read at call time — NEXT_PUBLIC_API_URL is embedded in the browser bundle
// correctly on every environment. Never read it at module level to avoid
// the build-time baking issue with the fallback value.
function backendUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
}

function authHeaders() {
  const token = AuthUtils.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetcher(url: string) {
  const token = AuthUtils.getAccessToken();
  const res = await fetch(url, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  return res.json();
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useUsers(limit = 20, offset = 0, search?: string, role?: string, is_active?: boolean) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (search)                  params.set('search', search);
  if (role)                    params.set('role', role);
  if (is_active !== undefined) params.set('is_active', String(is_active));

  // Call backend directly from the browser — same as every other hook
  const base = backendUrl();
  return useSWR<UsersListResponse>(
    `${base}/users?${params}`,
    fetcher,
    { revalidateOnFocus: false }
  );
}

export function useUserCount(role?: string, is_active?: boolean) {
  const params = new URLSearchParams();
  if (role)                    params.set('role', role);
  if (is_active !== undefined) params.set('is_active', String(is_active));
  const q = params.toString();
  const base = backendUrl();
  return useSWR<{ success: boolean; data: { count: number } }>(
    `${base}/users/count${q ? `?${q}` : ''}`,
    fetcher,
    { revalidateOnFocus: false }
  );
}

export function useCreateUser() {
  return useSWRMutation(
    'create-user',
    async (_key: string, { arg }: { arg: CreateUserRequest }) => {
      const res = await fetch(`${backendUrl()}/users`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(arg),
      });
      return res.json();
    }
  );
}

export function useUpdateUser() {
  return useSWRMutation(
    'update-user',
    async (_key: string, { arg }: { arg: { id: number; data: UpdateUserRequest } }) => {
      const res = await fetch(`${backendUrl()}/users/${arg.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(arg.data),
      });
      return res.json();
    }
  );
}

export function useToggleUserStatus() {
  return useSWRMutation(
    'toggle-user-status',
    async (_key: string, { arg }: { arg: { id: number; is_active: boolean } }) => {
      const res = await fetch(`${backendUrl()}/users/${arg.id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ is_active: arg.is_active }),
      });
      return res.json();
    }
  );
}

export function useDeleteUser() {
  return useSWRMutation(
    'delete-user',
    async (_key: string, { arg }: { arg: number }) => {
      const res = await fetch(`${backendUrl()}/users/${arg}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      return res.json();
    }
  );
}
