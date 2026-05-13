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
  getServices,
  addService,
  updateService,
  deleteService,
  getServiceCategories,
  getServiceSubcategories,
  getServiceTags,
  type Service,
  type ServiceCategory,
  type ServiceSubcategory,
  type ServiceTag
} from '@/lib/mockDatabase';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/image-upload';

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ServiceSubcategory[]>([]);
  const [tags, setTags] = useState<ServiceTag[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [availableSubcategories, setAvailableSubcategories] = useState<ServiceSubcategory[]>([]);
  const [serviceImages, setServiceImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

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

  useEffect(() => {
    setServices(getServices());
    setCategories(getServiceCategories());
    setSubcategories(getServiceSubcategories());
    setTags(getServiceTags());
  }, []);

  // Update available subcategories when categories change
  useEffect(() => {
    if (selectedCategories.length > 0) {
      const filteredSubs = subcategories.filter(sub =>
        selectedCategories.includes(sub.category_id)
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
    setTagInput('');
    setAvailableSubcategories([]);
    setServiceImages([]);
    setMainImageIndex(0);
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
      // Also remove subcategories from deselected category
      setSelectedSubcategories(selectedSubcategories.filter(subId => {
        const subcategory = subcategories.find(s => s.id === subId);
        return subcategory && subcategory.category_id !== categoryId;
      }));
    }
  };

  const handleSubcategoryChange = (subcategoryId: string, checked: boolean) => {
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
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const serviceData = {
        ...formData,
        category_ids: selectedCategories,
        subcategory_ids: selectedSubcategories,
        tag_ids: selectedTags,
        images: serviceImages, // This will be processed by the backend
        main_image_index: mainImageIndex,
      } as unknown as Omit<Service, 'id'>;

      if (editingService) {
        updateService(editingService.id, serviceData);
        setServices(services.map(s => s.id === editingService.id ? { ...s, ...serviceData } : s));
        toast.success('Service updated successfully');
      } else {
        const newService = addService(serviceData);
        setServices([...services, newService]);
        toast.success('Service added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save service');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      slug: service.slug || '',
      code: service.code || '',
      price: service.price || 0,
      sale_price: service.sale_price || 0,
      description: service.description || '',
      short_description: service.short_description || '',
      status: service.status || 'draft',
      is_featured: service.is_featured || false,
      seo_title: service.seo_title || '',
      seo_description: service.seo_description || '',
      meta_keywords: service.meta_keywords || '',
    });
    setSelectedCategories([]); // Would need to be populated from service relationships
    setSelectedSubcategories([]); // Would need to be populated from service relationships
    setSelectedTags([]); // Would need to be populated from service relationships
    setServiceImages([]); // Would need to be populated from service images
    setMainImageIndex(0); // Would need to be populated from service data
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        deleteService(id);
        setServices(services.filter(s => s.id !== id));
        toast.success('Service deleted successfully');
      } catch (error) {
        toast.error('Failed to delete service');
      }
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
                              checked={selectedCategories.includes(category.id)}
                              onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
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
                                checked={selectedSubcategories.includes(subcategory.id)}
                                onCheckedChange={(checked) => handleSubcategoryChange(subcategory.id, checked as boolean)}
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
                    <Input
                      id="meta_keywords"
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                      placeholder="web development, frontend, backend"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingService ? 'Update Service' : 'Create Service'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Services ({services.length})</CardTitle>
          <CardDescription>A list of all your services and their details</CardDescription>
        </CardHeader>
        <CardContent>
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
              {services.map((service) => (
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
                    <div className="font-medium">${service.price?.toFixed(2) || '0.00'}</div>
                    {service.sale_price && service.sale_price > 0 && (
                      <div className="text-sm text-green-600">${service.sale_price.toFixed(2)}</div>
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
                        onClick={() => handleDelete(service.id)}
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
        </CardContent>
      </Card>
    </div>
  );
}