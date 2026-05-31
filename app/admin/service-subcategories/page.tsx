'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import {
  useServiceCategoryTree,
  useServiceCategories,
  type ServiceCategory
} from '@/lib/hooks/use-service-categories';
import {
  useCreateServiceSubcategory,
  useUpdateServiceSubcategory,
  useDeleteServiceSubcategory,
  type ServiceSubcategory,
  type CreateSubcategoryRequest,
  type UpdateSubcategoryRequest
} from '@/lib/hooks/use-service-subcategories';
import { toast } from 'sonner';

export default function ServiceSubcategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<ServiceSubcategory | null>(null);

  const [formData, setFormData] = useState<CreateSubcategoryRequest & { category_id?: number }>({
    category_id: 0,
    name: '',
    slug: '',
    position: 0,
    is_active: true,
  });

  // SWR hooks
  const { data: categoryTree, error: subcategoriesError, isLoading: subcategoriesLoading, mutate: mutateSubcategories } = useServiceCategoryTree();
  const { data: allCategories, error: categoriesError, isLoading: categoriesLoading } = useServiceCategories();

  // API mutation hooks
  const { trigger: createSubcategory, isMutating: creatingSubcategory } = useCreateServiceSubcategory();
  const { trigger: updateSubcategory, isMutating: updatingSubcategory } = useUpdateServiceSubcategory();
  const { trigger: deleteSubcategory, isMutating: deletingSubcategory } = useDeleteServiceSubcategory();

  // Flatten subcategories from category tree
  const allSubcategories = useMemo(() => {
    if (!categoryTree) return [];
    return categoryTree.flatMap(category => category.subcategories || []);
  }, [categoryTree]);

  // Determine which data to display
  const displaySubcategories = useMemo(() => {
    let subcategories = allSubcategories;

    // Apply search filter (client-side since no search API for subcategories)
    if (searchTerm.trim()) {
      subcategories = subcategories.filter(subcategory =>
        subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subcategory.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      subcategories = subcategories.filter(subcategory => subcategory.category_id === parseInt(categoryFilter));
    }

    return subcategories;
  }, [allSubcategories, searchTerm, categoryFilter]);

  const isLoading = subcategoriesLoading || categoriesLoading;

  const getCategoryName = (categoryId: number) => {
    const category = allCategories?.find((c: ServiceCategory) => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const resetForm = () => {
    setFormData({
      category_id: 0,
      name: '',
      slug: '',
      position: allSubcategories.length + 1,
      is_active: true,
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleAddSubcategory = async () => {
    if (!formData.category_id) {
      toast.error('Please select a parent category');
      return;
    }
    try {
      // Extract category_id from formData and send the rest as subcategory data
      const { category_id, ...subcategoryData } = formData;
      await createSubcategory({ categoryId: category_id!, data: subcategoryData as CreateSubcategoryRequest });
      mutateSubcategories(); // Refresh the categories tree
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Service subcategory added successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add service subcategory');
    }
  };

  const handleEditSubcategory = (subcategory: ServiceSubcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      category_id: subcategory.category_id,
      name: subcategory.name,
      slug: subcategory.slug,
      position: subcategory.position,
      is_active: subcategory.is_active,
    });
  };

  const handleUpdateSubcategory = async () => {
    if (!editingSubcategory) return;
    if (!formData.category_id) {
      toast.error('Please select a parent category');
      return;
    }

    try {
      await updateSubcategory({ subcategoryId: editingSubcategory.id, data: formData as UpdateSubcategoryRequest });
      mutateSubcategories(); // Refresh the categories tree
      setEditingSubcategory(null);
      resetForm();
      toast.success('Service subcategory updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update service subcategory');
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: number) => {
    if (confirm('Are you sure you want to delete this service subcategory?')) {
      try {
        await deleteSubcategory(subcategoryId.toString());
        mutateSubcategories(); // Refresh the categories tree
        toast.success('Service subcategory deleted successfully');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to delete service subcategory');
      }
    }
  };

  const handleToggleStatus = async (subcategoryId: number, is_active: boolean) => {
    try {
      await updateSubcategory({ subcategoryId, data: { is_active } as UpdateSubcategoryRequest });
      mutateSubcategories(); // Refresh the categories tree
      toast.success(`Service subcategory ${is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update service subcategory status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Subcategories</h1>
          <p className="mt-2 text-gray-600">Manage subcategories under service categories</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Subcategory
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Service Subcategory</DialogTitle>
              <DialogDescription>
                Create a new subcategory under a service category.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category_id">Parent Category *</Label>
                <Select value={formData.category_id?.toString()} onValueChange={(value) => setFormData({ ...formData, category_id: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories?.filter((c: ServiceCategory) => c.is_active).map((category: ServiceCategory) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter subcategory name"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated-slug"
                />
                <p className="text-sm text-gray-500 mt-1">URL-friendly version of the name</p>
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
                <p className="text-sm text-gray-500 mt-1">Display order within category</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleAddSubcategory} disabled={creatingSubcategory}>
                {creatingSubcategory && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Add Subcategory
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category-filter">Parent Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories?.map((category: ServiceCategory) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subcategories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Subcategories ({displaySubcategories.length})</CardTitle>
          <CardDescription>Manage subcategories organized under parent categories</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading subcategories...</span>
            </div>
          ) : subcategoriesError ? (
            <div className="text-center py-8 text-red-500">
              Error loading subcategories: {subcategoriesError.message}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Parent Category</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displaySubcategories.map((subcategory) => (
                    <TableRow key={subcategory.id}>
                      <TableCell className="font-medium">{subcategory.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryName(subcategory.category_id)}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{subcategory.slug}</TableCell>
                      <TableCell>{subcategory.position}</TableCell>
                      <TableCell>
                        <Badge variant={subcategory.is_active ? 'default' : 'secondary'}>
                          {subcategory.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(subcategory.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSubcategory(subcategory)}
                            disabled={updatingSubcategory}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSubcategory(subcategory.id)}
                            disabled={deletingSubcategory}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {displaySubcategories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No service subcategories found matching the current filters.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingSubcategory} onOpenChange={(open) => !open && setEditingSubcategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service Subcategory</DialogTitle>
            <DialogDescription>
              Update subcategory details and parent category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_category_id">Parent Category *</Label>
              <Select value={formData.category_id?.toString()} onValueChange={(value) => setFormData({ ...formData, category_id: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories?.filter((c: ServiceCategory) => c.is_active).map((category: ServiceCategory) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_name">Name *</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit_slug">Slug</Label>
              <Input
                id="edit_slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_position">Position</Label>
              <Input
                id="edit_position"
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit_is_active">Active</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setEditingSubcategory(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubcategory} disabled={updatingSubcategory}>
              {updatingSubcategory && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update Subcategory
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}