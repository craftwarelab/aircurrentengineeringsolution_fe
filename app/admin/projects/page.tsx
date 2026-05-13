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
import {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  getProjectTags,
  type Project,
  type ProjectTag
} from '@/lib/mockDatabase';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/image-upload';

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<ProjectTag[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

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

  useEffect(() => {
    setProjects(getProjects());
    setTags(getProjectTags());
  }, []);

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
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
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
    setTagInput('');
    setProjectImages([]);
    setMainImageIndex(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const projectData = {
        ...formData,
        tag_ids: selectedTags,
        images: projectImages, // This will be processed by the backend
        main_image_index: mainImageIndex,
      } as unknown as Omit<Project, 'id'>;

      if (editingProject) {
        updateProject(editingProject.id, projectData);
        setProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...projectData } : p));
        toast.success('Project updated successfully');
      } else {
        const newProject = addProject(projectData);
        setProjects([...projects, newProject]);
        toast.success('Project added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      slug: project.slug || '',
      description: project.description || '',
      seo_title: project.seo_title || '',
      seo_description: project.seo_description || '',
      meta_keywords: project.meta_keywords || '',
      status: project.status || 'draft',
      results: [], // Projects don't have results in the new interface
    });
    setSelectedTags([]); // Would need to be populated from project relationships
    setProjectImages([]); // Would need to be populated from project images
    setMainImageIndex(0); // Would need to be populated from project data
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (deleteProject(id)) {
      setProjects(projects.filter(p => p.id !== id));
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
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
                    <Input
                      id="meta_keywords"
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                      placeholder="office building, construction, modern architecture"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProject ? 'Update Project' : 'Create Project'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects ({projects.length})</CardTitle>
          <CardDescription>A list of all your completed projects</CardDescription>
        </CardHeader>
        <CardContent>
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
                  {projects.map((project) => (
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
                            onClick={() => handleDelete(project.id)}
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
          </CardContent>
      </Card>
    </div>
  );
}