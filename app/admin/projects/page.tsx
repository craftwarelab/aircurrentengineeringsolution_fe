'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, X, Tag as TagIcon } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/image-upload';
import {
  useProjects,
  useCreateProject,
  type CreateProjectRequest,
  type Project,
  type ProjectImage
} from '@/lib/hooks/use-projects';
import { useProjectTags, useCreateProjectTags, type ProjectTag } from '@/lib/hooks/use-project-tags';
import api from '@/lib/api';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import axios from 'axios';

export default function AdminProjects() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // Selected tag IDs for update flow (from existing project tags)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // Existing project images for editing
  const [existingProjectImages, setExistingProjectImages] = useState<ProjectImage[]>([]);
  // Image IDs marked for deletion (will be deleted on Update)
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    seo_title: '',
    seo_description: '',
    meta_keywords: '',
    status: 'draft' as 'draft' | 'active' | 'inactive',
    results: [] as string[],
  });
  const [newResult, setNewResult] = useState('');

  // Backend pagination state (like products page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Real projects from API
  const { data: projectsResponse, error: projectsError, isLoading: projectsLoading, mutate: mutateProjects } = useProjects(currentPage, itemsPerPage);
  const projects = projectsResponse?.data?.data || projectsResponse?.data || [];

  // Use backend pagination info
  const apiPagination = (projectsResponse as any)?.data;
  const totalPages = apiPagination?.last_page || Math.max(1, Math.ceil((projectsResponse as any)?.data?.total / itemsPerPage) || 1);

  // Tags from real API
  const { data: projectTagsResponse } = useProjectTags();
  const tags: ProjectTag[] = Array.isArray(projectTagsResponse) ? projectTagsResponse : (projectTagsResponse as any)?.data || [];

  // API mutation hooks
  const { trigger: createProject, isMutating: creatingProject } = useCreateProject();
  const { trigger: createProjectTags, isMutating: creatingProjectTags } = useCreateProjectTags();

  // Meta keywords (chip style, identical to Products dialog)
  const [metaKeywordInput, setMetaKeywordInput] = useState('');
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);

  // Project creation progress dialog states (exact same pattern as Products & Services)
  const [isCreationStatusOpen, setIsCreationStatusOpen] = useState(false);
  const [creationStatus, setCreationStatus] = useState('');
  const [currentImageProgress, setCurrentImageProgress] = useState({ current: 0, total: 0 });

  // Project update progress dialog states (matching creation dialog style)
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateImageProgress, setUpdateImageProgress] = useState({ current: 0, total: 0 });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newSelectedTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newSelectedTags);

    // If user removed any tag, reset selectedTagIds so we rely on createProjectTags result on save
    if (newSelectedTags.length < selectedTags.length) {
      setSelectedTagIds([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Meta keyword handlers (exact same behavior as Products dialog)
  const addMetaKeyword = () => {
    const trimmed = metaKeywordInput.trim().replace(/,$/, '');
    if (trimmed && !metaKeywords.includes(trimmed)) {
      setMetaKeywords([...metaKeywords, trimmed]);
    }
    setMetaKeywordInput('');
  };

  const removeMetaKeyword = (keyword: string) => {
    setMetaKeywords(metaKeywords.filter(k => k !== keyword));
  };

  const handleMetaKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addMetaKeyword();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      seo_title: '',
      seo_description: '',
      meta_keywords: '',
      status: 'draft',
      results: [],
    });
    setEditingProject(null);
    setSelectedTags([]);
    setSelectedTagIds([]);
    setTagInput('');
    setMetaKeywordInput('');
    setMetaKeywords([]);
    setProjectImages([]);
    setMainImageIndex(0);
    setExistingProjectImages([]);
    setImagesToDelete([]);
    setCreationStatus('');
    setCurrentImageProgress({ current: 0, total: 0 });
    setUpdateStatus('');
    setUpdateImageProgress({ current: 0, total: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProject) {
        // Show updating progress dialog (same style as project creation)
        setIsUpdateStatusOpen(true);
        setUpdateStatus('Preparing update...');
        setUpdateImageProgress({ current: 0, total: 0 });

        // Step 1: Delete images marked for deletion
        if (imagesToDelete.length > 0) {
          setUpdateStatus(`Deleting ${imagesToDelete.length} image(s)...`);
          for (const imageId of imagesToDelete) {
            try {
              await api.delete(`/projects/images/${editingProject.id}/${imageId}`);
            } catch (e) {
              console.error('Failed to delete image', imageId);
            }
          }
        }

        // Step 2: Upload new images
        if (projectImages.length > 0) {
          setUpdateImageProgress({ current: 0, total: projectImages.length });
          setUpdateStatus('Uploading new images...');

          for (let i = 0; i < projectImages.length; i++) {
            const file = projectImages[i];
            const isMain = i === mainImageIndex;

            const formDataImage = new FormData();
            formDataImage.append('image', file);
            formDataImage.append('position', String(i));
            formDataImage.append('is_main', String(isMain));

            setUpdateStatus(`Uploading image ${i + 1} of ${projectImages.length}...`);
            setUpdateImageProgress({ current: i + 1, total: projectImages.length });

            try {
              await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/projects/images/${editingProject.id}`,
                formDataImage,
                {
                  headers: { 'Content-Type': 'multipart/form-data' },
                  withCredentials: true,
                }
              );
            } catch (e) {
              console.error('Failed to upload new image', i);
            }
          }
        }

        // Step 3: Create tags from current selection (new tags first, removed tags excluded)
        // Exactly the same logic as in the Product update dialog
        let finalTagIds: number[] = [];

        if (selectedTags.length > 0) {
          setUpdateStatus('Creating tags...');
          // Always create from current selectedTags.
          // Backend handles deduplication automatically.
          const tagResponse = await createProjectTags(selectedTags);
          const createdTags = (tagResponse as any)?.data || [];
          finalTagIds = createdTags.map((t: any) => t.id);
        }

        // Step 4: Update project data
        setUpdateStatus('Updating project details...');

        const updateData: any = {
          title: formData.title,
          slug: formData.slug,
          description: formData.description || undefined,
          seo_title: formData.seo_title || undefined,
          seo_description: formData.seo_description || undefined,
          meta_keywords: metaKeywords.join(', ') || undefined,
          status: formData.status,
        };

        if (finalTagIds.length > 0) {
          updateData.tag_ids = finalTagIds;
        }

        await api.put(`/projects/${editingProject.id}`, updateData);
        mutateProjects();

        setUpdateStatus('Project updated successfully!');

        // Close update status dialog after short delay
        setTimeout(() => {
          setIsUpdateStatusOpen(false);
          setUpdateStatus('');
          setUpdateImageProgress({ current: 0, total: 0 });
          setImagesToDelete([]);
          setProjectImages([]);
          toast.success('Project updated successfully');
        }, 1200);
      } else {
        // ==================== CREATE FLOW (standard working pattern like Products & Services) ====================
        // Step 1: Create tags first (if any) and get the IDs
        let tagIds: number[] = [];
        if (selectedTags.length > 0) {
          setCreationStatus('Creating tags...'); // will be shown after dialog opens
          const tagResponse = await createProjectTags(selectedTags);
          const createdTags = (tagResponse as any)?.data || [];
          tagIds = createdTags.map((tag: ProjectTag) => tag.id);
        }

        // Step 2: Create project as DRAFT, including the tag_ids in the body
        const draftProjectData: CreateProjectRequest = {
          title: formData.title,
          slug: formData.slug,
          description: formData.description || undefined,
          seo_title: formData.seo_title || undefined,
          seo_description: formData.seo_description || undefined,
          meta_keywords: metaKeywords.join(', ') || undefined,
          status: 'draft', // Always create as draft first
          tag_ids: tagIds, // Pass the freshly created tag IDs here
        };

        // Show status dialog
        setIsCreationStatusOpen(true);
        setCreationStatus('Creating draft project...');

        const createdProjectResponse: any = await createProject({
          url: `${process.env.NEXT_PUBLIC_API_URL}/projects/`,
          data: draftProjectData,
        });

        const projectId =
          createdProjectResponse?.data?.id ||
          createdProjectResponse?.id ||
          createdProjectResponse?.data?.data?.id;

        if (!projectId) {
          throw new Error('Failed to get created project ID from response');
        }

        setCreationStatus('Draft project created. Uploading images...');

        // Step 3: Upload images one by one
        if (projectImages.length > 0) {
          setCurrentImageProgress({ current: 0, total: projectImages.length });

          for (let i = 0; i < projectImages.length; i++) {
            const file = projectImages[i];
            const isMain = i === mainImageIndex;

            const formDataImage = new FormData();
            formDataImage.append('image', file);
            formDataImage.append('position', String(i));
            formDataImage.append('is_main', String(isMain));

            setCreationStatus(`Uploading image ${i + 1} of ${projectImages.length}...`);
            setCurrentImageProgress({ current: i + 1, total: projectImages.length });

            try {
              await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/projects/images/${projectId}`,
                formDataImage,
                {
                  headers: { 'Content-Type': 'multipart/form-data' },
                  withCredentials: true,
                }
              );
            } catch (imageError: any) {
              console.error(`Failed to upload image ${i + 1}:`, imageError.response?.data || imageError);
              // Continue with other images even if one fails
            }
          }
        }

        // Step 4: Update project status to final user-selected status (if not draft)
        if (formData.status !== 'draft') {
          setCreationStatus('Finalizing project status...');
          await api.put(`/projects/${projectId}`, {
            status: formData.status,
          });
        }

        setCreationStatus('Project created successfully!');

        // Refresh real project list and reset to first page
        mutateProjects();
        setCurrentPage(1);
        toast.success('Project created successfully with images');

        // Close status dialog after a short delay
        setTimeout(() => {
          setIsCreationStatusOpen(false);
          setCreationStatus('');
          setCurrentImageProgress({ current: 0, total: 0 });
        }, 1500);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      // Close any open progress dialogs on error
      setIsCreationStatusOpen(false);
      setCreationStatus('');
      setCurrentImageProgress({ current: 0, total: 0 });
      setIsUpdateStatusOpen(false);
      setUpdateStatus('');
      setUpdateImageProgress({ current: 0, total: 0 });
      toast.error(error?.response?.data?.message || 'Failed to save project');
    }
  };

  const handleEdit = async (project: Project) => {
    setEditingProject(project);

    setFormData({
      title: project.title || '',
      slug: project.slug || '',
      description: project.description || '',
      seo_title: project.seo_title || '',
      seo_description: project.seo_description || '',
      meta_keywords: project.meta_keywords || '',
      status: project.status || 'draft',
      results: [],
    });

    // Load existing tags
    const existingTagNames = (project.tags || []).map((t: any) => t.name);
    const existingTagIds = (project.tags || []).map((t: any) => t.id);
    setSelectedTags(existingTagNames);
    setSelectedTagIds(existingTagIds);

    // Meta keywords as chips (same as products)
    const existingKeywords = project.meta_keywords
      ? project.meta_keywords.split(',').map(k => k.trim()).filter(Boolean)
      : [];
    setMetaKeywords(existingKeywords);

    // New images only
    setProjectImages([]);
    setMainImageIndex(0);

    // Load existing images
    setImagesToDelete([]);
    try {
      const imagesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/images/${project.id}`,
        { withCredentials: true }
      );
      setExistingProjectImages(imagesResponse.data?.data || []);
    } catch (error) {
      console.error('Failed to load project images:', error);
      setExistingProjectImages([]);
    }

    setIsDialogOpen(true);
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete project "${project.title}"? This cannot be undone.`)) return;

    try {
      // Delete all images first (best effort)
      try {
        await api.delete(`/projects/images/project/${project.id}`);
      } catch (imgError) {
        console.error('Failed to delete project images (may have none):', imgError);
      }

      // Delete the project
      await api.delete(`/projects/${project.id}`);
      mutateProjects();
      setCurrentPage(1);

      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const addResult = () => {
    if (newResult.trim()) {
      setFormData({
        ...formData,
        results: [...formData.results, newResult.trim()],
      });
      setNewResult('');
    }
  };

  const removeResult = (index: number) => {
    setFormData({
      ...formData,
      results: formData.results.filter((_, i) => i !== index),
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const industries = ['Commercial Real Estate', 'Healthcare', 'Manufacturing', 'Education', 'Hospitality'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects Management</h1>
          <p className="mt-2 text-gray-600">Manage your completed projects portfolio</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
              <DialogDescription>
                {editingProject ? 'Update the project details below.' : 'Fill in the details for the new project.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Modern Office Building"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="modern-office-building"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="A state-of-the-art commercial building project"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Tags</h3>

                  <div>
                    <Label htmlFor="tags">Add Tags</Label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type tag and press Enter (e.g., construction, architecture)"
                        className="flex-1"
                      />
                      <Button type="button" onClick={addTag} variant="outline" size="sm">
                        <TagIcon className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>

                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50">
                        {selectedTags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Project Images</h3>
                  <ImageUpload
                    images={projectImages}
                    onImagesChange={setProjectImages}
                    maxImages={5}
                    mainImageIndex={mainImageIndex}
                    onMainImageChange={setMainImageIndex}
                  />

                  {/* Show existing images when editing */}
                  {editingProject && existingProjectImages.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Current Images</Label>
                      <div className="grid grid-cols-5 gap-3">
                        {existingProjectImages.map((img, index) => (
                          <div key={img.id} className="relative group border rounded-md overflow-hidden">
                            <img
                              src={getCloudinaryImageUrl(img.url, { width: 120, height: 120, crop: 'fill' })}
                              alt={`Project image ${index + 1}`}
                              className="w-full h-24 object-cover"
                            />
                            {img.is_main && (
                              <div className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                                Main
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setImagesToDelete(prev => [...prev, img.id]);
                                setExistingProjectImages(existingProjectImages.filter(i => i.id !== img.id));
                                toast.info('Image will be deleted when you click Update');
                              }}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            {!img.is_main && (
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await api.put(`/projects/images/${editingProject.id}/main/${img.id}`);
                                    const res = await api.get(`/projects/images/${editingProject.id}`);
                                    setExistingProjectImages(res.data?.data || []);
                                    toast.success('Main image updated');
                                  } catch (e) {
                                    toast.error('Failed to set main image');
                                  }
                                }}
                                className="absolute bottom-1 right-1 bg-white/90 text-gray-700 text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                              >
                                Set Main
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status & Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Status & Settings</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value: 'draft' | 'active' | 'inactive') => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Switch
                        id="is_featured"
                        checked={false} // Projects don't have featured flag in the provided structure
                        disabled
                      />
                      <Label htmlFor="is_featured">Featured (Not available for projects)</Label>
                    </div>
                  </div>
                </div>

                {/* SEO */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">SEO Settings</h3>

                  <div>
                    <Label htmlFor="seo_title">SEO Title</Label>
                    <Input
                      id="seo_title"
                      value={formData.seo_title}
                      onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                      placeholder="Modern Office Building Construction Project"
                    />
                  </div>

                  <div>
                    <Label htmlFor="seo_description">SEO Description</Label>
                    <Textarea
                      id="seo_description"
                      value={formData.seo_description}
                      onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                      placeholder="Learn about our latest modern office building construction project"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_keywords">Meta Keywords</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        id="meta_keywords"
                        value={metaKeywordInput}
                        onChange={(e) => setMetaKeywordInput(e.target.value)}
                        onKeyDown={handleMetaKeywordKeyDown}
                        onBlur={addMetaKeyword}
                        placeholder="Type keyword and press comma or Enter"
                        className="flex-1"
                      />
                    </div>
                    {metaKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50">
                        {metaKeywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {keyword}
                            <button
                              type="button"
                              onClick={() => removeMetaKeyword(keyword)}
                              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Separate keywords with comma or Enter</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creatingProject || creatingProjectTags}>
                  {(creatingProject || creatingProjectTags) && 'Saving... '}
                  {editingProject ? 'Update Project' : 'Create Project'}
                </Button>
              </DialogFooter>
            </form>
           </DialogContent>
         </Dialog>
       </div>

       {/* Project Creation Status Dialog (exact same pattern as Products & Services) */}
       <Dialog open={isCreationStatusOpen} onOpenChange={setIsCreationStatusOpen}>
         <DialogContent className="sm:max-w-[400px]">
           <DialogHeader>
             <DialogTitle>Creating Project</DialogTitle>
             <DialogDescription>
               Please wait while we create your project and upload images.
             </DialogDescription>
           </DialogHeader>
           <div className="py-6">
             <div className="flex flex-col items-center justify-center space-y-4">
               <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
               <p className="text-sm text-gray-600 text-center">{creationStatus}</p>
               
               {currentImageProgress.total > 0 && (
                 <div className="w-full">
                   <div className="flex justify-between text-xs text-gray-500 mb-1">
                     <span>Images uploaded</span>
                     <span>{currentImageProgress.current} / {currentImageProgress.total}</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div 
                       className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                       style={{ 
                         width: `${(currentImageProgress.current / currentImageProgress.total) * 100}%` 
                       }} 
                     />
                   </div>
                 </div>
               )}
             </div>
           </div>
         </DialogContent>
        </Dialog>

        {/* Project Update Status Dialog (matching creation progress dialog style) */}
        <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Updating Project</DialogTitle>
              <DialogDescription>
                Please wait while we update your project and images.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-600 text-center">{updateStatus}</p>
                
                {updateImageProgress.total > 0 && (
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Images processed</span>
                      <span>{updateImageProgress.current} / {updateImageProgress.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${(updateImageProgress.current / updateImageProgress.total) * 100}%` 
                        }} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Card>
        <CardHeader>
          <CardTitle>All Projects ({(projectsResponse as any)?.data?.total ?? projects.length})</CardTitle>
          <CardDescription>A list of all your projects</CardDescription>
        </CardHeader>
        <CardContent>
          {projectsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              <span className="ml-3 text-gray-600">Loading projects...</span>
            </div>
          ) : projectsError ? (
            <div className="text-center py-8 text-red-500">
              Error loading projects: {(projectsError as any).message}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[25%]">Title</TableHead>
                      <TableHead className="hidden md:table-cell w-[20%]">Slug</TableHead>
                      <TableHead className="w-[35%]">Description</TableHead>
                      <TableHead className="w-[10%]">Status</TableHead>
                      <TableHead className="text-right w-[10%]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project: Project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          <div className="break-words">
                            <div className="font-medium truncate" title={project.title}>{project.title}</div>
                            {project.slug && (
                              <div className="text-sm text-gray-500 font-mono truncate md:hidden" title={`/${project.slug}`}>/{project.slug}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm hidden md:table-cell">
                          <div className="break-all truncate" title={project.slug}>{project.slug || '-'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="break-words line-clamp-2" title={project.description || 'No description'}>
                            {project.description || 'No description'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={project.status === 'active' ? 'default' : project.status === 'inactive' ? 'secondary' : 'outline'}>
                            {project.status || 'draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(project)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(project)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {projects.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No projects found. Create your first project above.
                </div>
              )}

              {/* Pagination (like products page) */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, projects.length)} of {(projectsResponse as any)?.data?.total ?? projects.length} projects
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[36px]"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}