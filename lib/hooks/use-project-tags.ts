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
export interface ProjectTag {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
}

export interface CreateTagRequest {
  name: string;
}

export interface UpdateTagRequest {
  name: string;
}

export interface TagsResponse {
  success: boolean;
  data: ProjectTag[];
  message?: string;
}

export interface TagResponse {
  success: boolean;
  data: ProjectTag;
  message?: string;
}

export type TagsArray = ProjectTag[];

export interface ProjectsByTagResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    slug: string;
    created_at: string;
    projects: any[];
  };
}

// Get all project tags
export function useProjectTags() {
  return useApiGet<ProjectTag[]>(process.env.NEXT_PUBLIC_API_URL + '/projects/tags/all');
}

// Get project tag by ID
export function useProjectTag(tagId: number | null) {
  return useApiGet<TagResponse>(
    tagId ? process.env.NEXT_PUBLIC_API_URL + `/projects/tags/${tagId}` : null
  );
}

// Search project tags
export function useSearchProjectTags(query: string) {
  return useApiGet<ProjectTag[]>(
    query ? process.env.NEXT_PUBLIC_API_URL + `/projects/tags/filter/search?keyword=${encodeURIComponent(query)}` : null
  );
}

// Get projects by project tag
export function useProjectsByProjectTag(
  tagId: number | null,
  page: number = 1,
  limit: number = 10
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const url = tagId
    ? `${process.env.NEXT_PUBLIC_API_URL}/projects/tags/${tagId}/projects?${params.toString()}`
    : null;

  return useApiGet<ProjectsByTagResponse>(url);
}

// Create project tags (accepts array of tag names)
export function useCreateProjectTags() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'create-project-tags',
    async (key: string, { arg }: { arg: string[] }) => {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/projects/tags`, arg);
      return response.data as TagsResponse;
    }
  );
}

// Update project tag
export function useUpdateProjectTag() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'update-project-tag',
    async (key: string, { arg }: { arg: { tagId: number, data: UpdateTagRequest } }) => {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/projects/tags/${arg.tagId}`, arg.data);
      return response.data as TagResponse;
    }
  );
}

// Delete project tag
export function useDeleteProjectTag() {
  if (!useSWRMutation) {
    return {
      trigger: () => Promise.reject(new Error('SWR not installed')),
      isMutating: false,
      error: null,
      data: null,
    };
  }

  return useSWRMutation(
    'delete-project-tag',
    async (key: string, { arg }: { arg: string }) => {
      const response = await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/projects/tags/${arg}`);
      // Handle cases where backend returns null or empty response
      return (response.data && response.data !== 'null') ? response.data : { message: 'Deleted successfully' };
    }
  );
}