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
  type ServiceCategory,
  type ServiceSubcategory,
  type ServiceTag
} from '@/lib/mockDatabase';
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  type Service,
  type ServiceImage,
  type CreateServiceRequest
} from '@/lib/hooks/use-services';
import {
  useServiceCategories,
  useServiceCategoryTree,
  type ServiceCategory as ApiServiceCategory
} from '@/lib/hooks/use-service-categories';
import {
  useServiceSubcategoriesByCategory
} from '@/lib/hooks/use-service-subcategories';
import { useServiceTags, useCreateServiceTags } from '@/lib/hooks/use-service-tags';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/image-upload';
import api from '@/lib/api';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';

export default function AdminServices() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ServiceSubcategory[]>([]);
  const [tags, setTags] = useState<ServiceTag[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [availableSubcategories, setAvailableSubcategories] = useState<ServiceSubcategory[]>([]);
  const [serviceImages, setServiceImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // Selected tag IDs for update flow (like products)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // Existing service images for editing + images marked for deletion
  const [existingServiceImages, setExistingServiceImages] = useState<ServiceImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  // Creation status dialog states (exactly like products)
  const [isCreationStatusOpen, setIsCreationStatusOpen] = useState(false);
  const [creationStatus, setCreationStatus] = useState('');
  const [currentImageProgress, setCurrentImageProgress] = useState({ current: 0, total: 0 });

  // Update status dialog states
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateImageProgress, setUpdateImageProgress] = useState({ current: 0, total: 0 });

  // Delete confirmation & progress states (like products)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleteProgressOpen, setIsDeleteProgressOpen] = useState(false);
  const [deleteProgressStatus, setDeleteProgressStatus] = useState('');

  // Meta keywords as chips (like products page)
  const [metaKeywordInput, setMetaKeywordInput] = useState('');
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    code: '',
    price: 0,
    sale_price: 0,
    description: '',
    short_description: '',
    status: 'draft' as 'draft' | 'active' | 'inactive',
    is_featured: false,
    seo_title: '',
    seo_description: '',
    meta_keywords: '',
  });

  // Backend pagination state (like products page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Real services from API (server-side pagination)
  const { data: servicesResponse, error: servicesError, isLoading: servicesLoading, mutate: mutateServices } = useServices(currentPage, itemsPerPage);

  // Defensive extraction (matches products page pattern to handle different backend response shapes)
  const services = (servicesResponse as any)?.data?.data || (servicesResponse as any)?.data || [];

  // Use backend pagination info when available (support multiple possible shapes)
  const apiPagination = (servicesResponse as any)?.data?.pagination || (servicesResponse as any)?.data || (servicesResponse as any)?.pagination;
  const totalPages = apiPagination?.last_page || apiPagination?.totalPages || Math.max(1, Math.ceil((apiPagination?.total || 0) / itemsPerPage) || 1);

  // API mutation hooks
  const { trigger: createService, isMutating: creatingService } = useCreateService();
  const { trigger: updateService, isMutating: updatingService } = useUpdateService();
  const { trigger: deleteServiceTrigger } = useDeleteService();
  const { trigger: createServiceTags, isMutating: creatingServiceTags } = useCreateServiceTags();

  // Real categories, tree, and tags from API
  const { data: categoriesData } = useServiceCategories();
  const { data: categoryTree } = useServiceCategoryTree();
  const { data: tagsData } = useServiceTags();

  // Update local categories/subs/tags when real data arrives (for dialog)
  useEffect(() => {
    const realCats: ServiceCategory[] = Array.isArray(categoriesData)
      ? categoriesData
      : (categoriesData as any)?.data || [];
    setCategories(realCats);

    const realSubs: ServiceSubcategory[] = (categoryTree || []).flatMap((cat: any) =>
      (cat.subcategories || []).map((s: any) => ({ ...s, category_id: cat.id }))
    );
    setSubcategories(realSubs);

    const realTags: ServiceTag[] = Array.isArray(tagsData)
      ? tagsData
      : (tagsData as any)?.data || [];
    setTags(realTags);
  }, [categoriesData, categoryTree, tagsData]);

  // Update available subcategories when categories change (supports both string and number ids during transition)
  useEffect(() => {
    if (selectedCategories.length > 0) {
      const filteredSubs = subcategories.filter((sub: any) =>
        selectedCategories.includes(Number(sub.category_id))
      );
      setAvailableSubcategories(filteredSubs);
    } else {
      setAvailableSubcategories([]);
    }
  }, [selectedCategories, subcategories]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      code: '',
      price: 0,
      sale_price: 0,
      description: '',
      short_description: '',
      status: 'draft',
      is_featured: false,
      seo_title: '',
      seo_description: '',
      meta_keywords: '',
    });
    setEditingService(null);
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedTags([]);
    setSelectedTagIds([]);
    setTagInput('');
    setAvailableSubcategories([]);
    setServiceImages([]);
    setMainImageIndex(0);
    setExistingServiceImages([]);
    setImagesToDelete([]);
    setMetaKeywords([]);
    setMetaKeywordInput('');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
      setSelectedSubcategories(selectedSubcategories.filter(subId => {
        const subcategory = subcategories.find((s: any) => Number(s.id) === subId);
        return subcategory && Number(subcategory.category_id) !== categoryId;
      }));
    }
  };

  const handleSubcategoryChange = (subcategoryId: number, checked: boolean) => {
    if (checked) {
      setSelectedSubcategories([...selectedSubcategories, subcategoryId]);
    } else {
      setSelectedSubcategories(selectedSubcategories.filter(id => id !== subcategoryId));
    }
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

    // If user removed any tag, reset selectedTagIds so we rely on createServiceTags result on save (exactly like products)
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

  // Meta keywords handlers (chips - like products)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingService) {
        // ==================== UPDATE FLOW (like products) ====================
        setIsUpdateStatusOpen(true);
        setUpdateStatus('Preparing update...');
        setUpdateImageProgress({ current: 0, total: 0 });

        // Step 1: Delete images marked for deletion
        if (imagesToDelete.length > 0) {
          setUpdateStatus(`Deleting ${imagesToDelete.length} image(s)...`);
          for (const imageId of imagesToDelete) {
            try {
              await api.delete(`/services/images/${editingService.id}/${imageId}`);
            } catch (e) {
              console.error('Failed to delete service image', imageId);
            }
          }
        }

        // Step 2: Upload new images
        if (serviceImages.length > 0) {
          setUpdateImageProgress({ current: 0, total: serviceImages.length });
          setUpdateStatus('Uploading new images...');

          for (let i = 0; i < serviceImages.length; i++) {
            const file = serviceImages[i];
            const isMain = i === mainImageIndex;

            const formDataImage = new FormData();
            formDataImage.append('image', file);
            formDataImage.append('position', String(i));
            formDataImage.append('is_main', String(isMain));

            setUpdateStatus(`Uploading image ${i + 1} of ${serviceImages.length}...`);
            setUpdateImageProgress({ current: i + 1, total: serviceImages.length });

            try {
              await api.post(
                `${process.env.NEXT_PUBLIC_API_URL}/services/images/${editingService.id}`,
                formDataImage,
                { headers: { 'Content-Type': 'multipart/form-data' } }
              );
            } catch (e) {
              console.error('Failed to upload new service image', i);
            }
          }
        }

        // Step 3: Create tags from current selection
        let finalTagIds: number[] = [];
        if (selectedTags.length > 0) {
          const tagResponse = await createServiceTags(selectedTags);
          const createdTags = (tagResponse as any)?.data || [];
          finalTagIds = createdTags.map((t: any) => t.id);
        }

        // Step 4: Update service data
        setUpdateStatus('Updating service details...');

        const updateData: any = {
          name: formData.name,
          slug: formData.slug,
          code: formData.code || undefined,
          price: formData.price,
          sale_price: formData.sale_price || undefined,
          description: formData.description || undefined,
          short_description: formData.short_description || undefined,
          status: formData.status,
          is_featured: formData.is_featured,
          seo_title: formData.seo_title || undefined,
          seo_description: formData.seo_description || undefined,
          meta_keywords: metaKeywords.join(', ') || undefined,
          category_ids: selectedCategories,
          subcategory_ids: selectedSubcategories,
        };

        if (finalTagIds.length > 0) {
          updateData.tag_ids = finalTagIds;
        }

        await api.put(`/services/${editingService.id}`, updateData);
        mutateServices();

        setUpdateStatus('Service updated successfully!');

        setTimeout(() => {
          setIsUpdateStatusOpen(false);
          setUpdateStatus('');
          setUpdateImageProgress({ current: 0, total: 0 });
          setImagesToDelete([]);
          setServiceImages([]);
          toast.success('Service updated successfully');
        }, 1200);
      } else {
        // ==================== CREATE FLOW (like products) ====================
        let tagIds: number[] = [];
        if (selectedTags.length > 0) {
          const tagResponse = await createServiceTags(selectedTags);
          const createdTags = (tagResponse as any)?.data || [];
          tagIds = createdTags.map((tag: any) => tag.id);
        }

        // Create as DRAFT first
        const draftServiceData: CreateServiceRequest = {
          name: formData.name,
          slug: formData.slug,
          code: formData.code || undefined,
          price: formData.price,
          sale_price: formData.sale_price || undefined,
          description: formData.description || undefined,
          short_description: formData.short_description || undefined,
          status: 'draft',
          is_featured: formData.is_featured,
          seo_title: formData.seo_title || undefined,
          seo_description: formData.seo_description || undefined,
          meta_keywords: metaKeywords.join(', ') || undefined,
          category_ids: selectedCategories,
          subcategory_ids: selectedSubcategories,
          tag_ids: tagIds,
          images: [],
        };

        setIsCreationStatusOpen(true);
        setCreationStatus('Creating draft service...');

        const createdServiceResponse: any = await createService({
          url: `${process.env.NEXT_PUBLIC_API_URL}/services/`,
          data: draftServiceData,
        });

        const serviceId =
          createdServiceResponse?.data?.id ||
          createdServiceResponse?.id ||
          createdServiceResponse?.data?.data?.id;

        if (!serviceId) {
          throw new Error('Failed to get created service ID from response');
        }

        setCreationStatus('Draft service created. Uploading images...');

        // Upload images one by one
        if (serviceImages.length > 0) {
          setCurrentImageProgress({ current: 0, total: serviceImages.length });

          for (let i = 0; i < serviceImages.length; i++) {
            const file = serviceImages[i];
            const isMain = i === mainImageIndex;

            const formDataImage = new FormData();
            formDataImage.append('image', file);
            formDataImage.append('position', String(i));
            formDataImage.append('is_main', String(isMain));

            setCreationStatus(`Uploading image ${i + 1} of ${serviceImages.length}...`);
            setCurrentImageProgress({ current: i + 1, total: serviceImages.length });

            try {
              await api.post(
                `${process.env.NEXT_PUBLIC_API_URL}/services/images/${serviceId}`,
                formDataImage,
                { headers: { 'Content-Type': 'multipart/form-data' } }
              );
            } catch (imageError: any) {
              console.error(`Failed to upload service image ${i + 1}:`, imageError.response?.data || imageError);
            }
          }
        }

        // Finalize status if not draft
        if (formData.status !== 'draft') {
          setCreationStatus('Finalizing service status...');
          await api.put(`/services/${serviceId}`, { status: formData.status });
        }

        setCreationStatus('Service created successfully!');

        mutateServices();
        setCurrentPage(1);
        toast.success('Service created successfully with images');

        setTimeout(() => {
          setIsCreationStatusOpen(false);
          setCreationStatus('');
          setCurrentImageProgress({ current: 0, total: 0 });
        }, 1500);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save service');
      setIsCreationStatusOpen(false);
      setIsUpdateStatusOpen(false);
    }
  };

  const handleEdit = async (service: Service) => {
    setEditingService(service);

    setFormData({
      name: service.name || '',
      slug: service.slug || '',
      code: service.code || '',
      price: Number(service.price) || 0,
      sale_price: Number(service.sale_price) || 0,
      description: service.description || '',
      short_description: service.short_description || '',
      status: (service.status as 'draft' | 'active' | 'inactive') || 'draft',
      is_featured: service.is_featured || false,
      seo_title: service.seo_title || '',
      seo_description: service.seo_description || '',
      meta_keywords: service.meta_keywords || '',
    });

    // Meta keywords as chips
    const existingKeywords = service.meta_keywords
      ? service.meta_keywords.split(',').map(k => k.trim()).filter(Boolean)
      : [];
    setMetaKeywords(existingKeywords);

    // Pre-select categories and subcategories from the service (if populated)
    const catIds = (service.categories || []).map((c: any) => Number(c.id));
    const subIds = (service.subcategories || []).map((s: any) => Number(s.id));
    setSelectedCategories(catIds);
    setSelectedSubcategories(subIds);

    // Load existing tags
    const existingTagNames = (service.tags || []).map((t: any) => t.name);
    const existingTagIds = (service.tags || []).map((t: any) => Number(t.id));
    setSelectedTags(existingTagNames);
    setSelectedTagIds(existingTagIds);

    // New images to upload
    setServiceImages([]);
    setMainImageIndex(0);
    setImagesToDelete([]);

    // Load existing service images
    try {
      const imagesResponse = await api.get(
        `${process.env.NEXT_PUBLIC_API_URL}/services/images/${service.id}`
      );
      setExistingServiceImages(imagesResponse.data?.data || []);
    } catch (error) {
      console.error('Failed to load service images:', error);
      setExistingServiceImages([]);
    }

    setIsDialogOpen(true);
  };

  const handleDelete = (service: Service) => {
    setServiceToDelete(service);
    setDeleteConfirmText('');
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete || deleteConfirmText.toLowerCase() !== 'delete') {
      toast.error('Please type "delete" to confirm');
      return;
    }

    setIsDeleteDialogOpen(false);

    setIsDeleteProgressOpen(true);
    setDeleteProgressStatus('Deleting service images...');

    try {
      // Step 1: Delete all images first (best effort)
      try {
        await api.delete(`/services/images/${serviceToDelete.id}`);
      } catch (imgError) {
        console.error('Failed to delete service images (may have none):', imgError);
      }

      // Step 2: Delete the service
      setDeleteProgressStatus('Deleting service...');
      await api.delete(`/services/${serviceToDelete.id}`);
      mutateServices();
      setCurrentPage(1);

      setDeleteProgressStatus('Service deleted successfully!');

      setTimeout(() => {
        setIsDeleteProgressOpen(false);
        setDeleteProgressStatus('');
        setServiceToDelete(null);
        toast.success('Service deleted successfully');
      }, 1000);
    } catch (error) {
      setIsDeleteProgressOpen(false);
      setDeleteProgressStatus('');
      toast.error('Failed to delete service');
    }
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
          <p className="mt-2 text-gray-600">Manage your HVAC services and offerings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription>
                {editingService ? 'Update the service details below.' : 'Fill in the details for the new service.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Web Development Service"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="web-development-service"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="code">Code</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="WD001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        placeholder="999.99"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sale_price">Sale Price</Label>
                      <Input
                        id="sale_price"
                        type="number"
                        step="0.01"
                        value={formData.sale_price}
                        onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })}
                        placeholder="899.99"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Professional web development services including frontend and backend development."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="short_description">Short Description</Label>
                    <Textarea
                      id="short_description"
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      placeholder="Expert web development solutions"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Categories & Subcategories */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Categories & Subcategories</h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Categories</Label>
                      <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                        {categories.filter(c => c.is_active).map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={selectedCategories.includes(Number(category.id))}
                              onCheckedChange={(checked) => handleCategoryChange(Number(category.id), checked as boolean)}
                            />
                            <Label htmlFor={`category-${category.id}`} className="text-sm">
                              {category.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Subcategories {selectedCategories.length === 0 && '(Select categories first)'}
                      </Label>
                      <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                        {availableSubcategories.length > 0 ? (
                          availableSubcategories.filter(s => s.is_active).map((subcategory) => (
                            <div key={subcategory.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`subcategory-${subcategory.id}`}
                                checked={selectedSubcategories.includes(Number(subcategory.id))}
                                onCheckedChange={(checked) => handleSubcategoryChange(Number(subcategory.id), checked as boolean)}
                              />
                              <Label htmlFor={`subcategory-${subcategory.id}`} className="text-sm">
                                {subcategory.name}
                              </Label>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            {selectedCategories.length === 0
                              ? 'Select categories above to see available subcategories'
                              : 'No subcategories available for selected categories'
                            }
                          </p>
                        )}
                      </div>
                    </div>
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
                        placeholder="Type tag and press Enter (e.g., web development, frontend)"
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

                {/* Service Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Service Images</h3>
                   <ImageUpload
                     images={serviceImages}
                     onImagesChange={setServiceImages}
                     maxImages={5}
                     mainImageIndex={mainImageIndex}
                     onMainImageChange={setMainImageIndex}
                   />

                   {/* Show existing images when editing (exactly like products) */}
                   {editingService && existingServiceImages.length > 0 && (
                     <div>
                       <Label className="text-sm font-medium text-gray-700 mb-2 block">Current Images</Label>
                       <div className="grid grid-cols-5 gap-3">
                         {existingServiceImages.map((img, index) => (
                           <div key={img.id} className="relative group border rounded-md overflow-hidden">
                             <img
                               src={getCloudinaryImageUrl(img.url, { width: 120, height: 120, crop: 'fill' })}
                               alt={`Service image ${index + 1}`}
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
                                 // Mark image for deletion (will delete on Update)
                                 setImagesToDelete(prev => [...prev, img.id]);
                                 setExistingServiceImages(existingServiceImages.filter(i => i.id !== img.id));
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
                                     await api.patch(`/services/images/${editingService.id}/main/${img.id}`);
                                     // Refresh images (use same endpoint shape as load)
                                     const res = await api.get(`/services/images/${editingService.id}`);
                                     setExistingServiceImages(res.data?.data || []);
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
                        checked={formData.is_featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                      />
                      <Label htmlFor="is_featured">Featured Service</Label>
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
                      placeholder="Web Development Services | Professional Solutions"
                    />
                  </div>

                  <div>
                    <Label htmlFor="seo_description">SEO Description</Label>
                    <Textarea
                      id="seo_description"
                      value={formData.seo_description}
                      onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                      placeholder="Get professional web development services from our expert team."
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
                <Button type="submit" disabled={creatingService || updatingService || creatingServiceTags}>
                  {(creatingService || updatingService || creatingServiceTags) && 'Saving... '}
                  {editingService ? 'Update Service' : 'Create Service'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Services ({(servicesResponse as any)?.data?.total ?? (servicesResponse as any)?.total ?? services.length})</CardTitle>
          <CardDescription>A list of all your services and their details</CardDescription>
        </CardHeader>
        <CardContent>
          {servicesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              <span className="ml-3 text-gray-600">Loading services...</span>
            </div>
          ) : servicesError ? (
            <div className="text-center py-8 text-red-500">
              Error loading services: {servicesError.message}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service: Service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          {service.slug && (
                            <div className="text-sm text-gray-500 font-mono">/{service.slug}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{service.code || '-'}</TableCell>
                      <TableCell>
                        <div className="font-medium">${Number(service.price || 0).toFixed(2)}</div>
                        {service.sale_price && Number(service.sale_price) > 0 && (
                          <div className="text-sm text-green-600">${Number(service.sale_price).toFixed(2)}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.status === 'active' ? 'default' : service.status === 'inactive' ? 'secondary' : 'outline'}>
                          {service.status || 'draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {service.is_featured ? (
                          <Badge variant="default">Featured</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(service)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {services.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No services found. Create your first service above.
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, (servicesResponse as any)?.data?.total ?? (servicesResponse as any)?.total ?? services.length)} of {(servicesResponse as any)?.data?.total ?? (servicesResponse as any)?.total ?? services.length} services
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .reduce<(number | 'e')[]>((acc, p, i, arr) => { if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('e'); acc.push(p); return acc; }, [])
                      .map((p, i) => p === 'e'
                        ? <span key={`e${i}`} className="px-1 text-gray-400 text-sm select-none">…</span>
                        : <Button key={p} variant={currentPage === p ? 'default' : 'outline'} size="sm" className="w-8 h-8 p-0" onClick={() => setCurrentPage(p as number)}>{p}</Button>
                      )}
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Service Creation Status Dialog */}
      <Dialog open={isCreationStatusOpen} onOpenChange={setIsCreationStatusOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Creating Service</DialogTitle>
            <DialogDescription>
              Please wait while we create your service and upload images.
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
                      style={{ width: `${(currentImageProgress.current / currentImageProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Update Status Dialog */}
      <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Updating Service</DialogTitle>
            <DialogDescription>
              Please wait while we update your service and images.
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
                      style={{ width: `${(updateImageProgress.current / updateImageProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All images and data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-gray-600">
              To confirm deletion, please type <strong>delete</strong> below:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder='Type "delete" here'
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteService}
              disabled={deleteConfirmText.toLowerCase() !== 'delete'}
            >
              Delete Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Progress Dialog */}
      <Dialog open={isDeleteProgressOpen} onOpenChange={setIsDeleteProgressOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Deleting Service</DialogTitle>
            <DialogDescription>
              Please wait while we remove all images and delete the service.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600 text-center">{deleteProgressStatus}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}