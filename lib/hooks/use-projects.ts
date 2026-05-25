import { useApiGet, useApiPost } from '@/lib/hooks/use-api';
import { ProjectTag } from './use-project-tags';

export interface ProjectImage {
  id: number;
  project_id: number;
  url: string;
  is_main: boolean;
  position: number;
  created_at: string;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
  meta_keywords?: string;
  status: 'draft' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  images?: ProjectImage[];
  tags?: ProjectTag[];
}

export interface CreateProjectRequest {
  title: string;
  slug: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
  meta_keywords?: string;
  status?: 'draft' | 'active' | 'inactive';
  tag_ids?: number[];
  images?: any[];
}

export interface ProjectsResponse {
  success: boolean;
  data: {
    data: Project[];
    total: number;
    page: number;
    last_page: number;
  };
}

// Get all projects with pagination (and optional status filter)
export function useProjects(page: number = 1, limit: number = 10, status?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) params.append('status', status);

  const url = `${process.env.NEXT_PUBLIC_API_URL}/projects?${params.toString()}`;
  return useApiGet<ProjectsResponse>(url);
}

// Get single project by ID
export function useProject(projectId: number | null) {
  const url = projectId ? `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}` : null;
  return useApiGet<{ success: boolean; data: Project }>(url);
}

// Create project
export function useCreateProject() {
  return useApiPost<{ success: boolean; message: string; data: Project }>();
}

// Note: Update and Delete are performed via direct api calls in the page (like products),
// followed by mutate() on the list hook. Search/filter hooks can be added later if needed.
