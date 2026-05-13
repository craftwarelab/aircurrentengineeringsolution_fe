'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { getProductSubcategories, addProductSubcategory, updateProductSubcategory, deleteProductSubcategory, getProductCategories, type ProductSubcategory, type ProductCategory } from '@/lib/mockDatabase';
import { toast } from 'sonner';

export default function ProductSubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<ProductSubcategory[]>(getProductSubcategories());
  const [categories] = useState<ProductCategory[]>(getProductCategories());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<ProductSubcategory | null>(null);

  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    slug: '',
    position: 0,
    is_active: true,
  });

  const filteredSubcategories = subcategories.filter(subcategory => {
    const matchesSearch = subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subcategory.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || subcategory.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      name: '',
      slug: '',
      position: subcategories.length + 1,
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

  const handleAddSubcategory = () => {
    if (!formData.category_id) {
      toast.error('Please select a parent category');
      return;
    }
    try {
      const newSubcategory = addProductSubcategory(formData);
      setSubcategories(getProductSubcategories());
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Product subcategory added successfully');
    } catch (error) {
      toast.error('Failed to add product subcategory');
    }
  };

  const handleEditSubcategory = (subcategory: ProductSubcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      category_id: subcategory.category_id,
      name: subcategory.name,
      slug: subcategory.slug,
      position: subcategory.position,
      is_active: subcategory.is_active,
    });
  };

  const handleUpdateSubcategory = () => {
    if (!editingSubcategory) return;
    if (!formData.category_id) {
      toast.error('Please select a parent category');
      return;
    }

    try {
      updateProductSubcategory(editingSubcategory.id, formData);
      setSubcategories(getProductSubcategories());
      setEditingSubcategory(null);
      resetForm();
      toast.success('Product subcategory updated successfully');
    } catch (error) {
      toast.error('Failed to update product subcategory');
    }
  };

  const handleDeleteSubcategory = (subcategoryId: string) => {
    if (confirm('Are you sure you want to delete this product subcategory?')) {
      try {
        deleteProductSubcategory(subcategoryId);
        setSubcategories(getProductSubcategories());
        toast.success('Product subcategory deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product subcategory');
      }
    }
  };

  const handleToggleStatus = (subcategoryId: string, is_active: boolean) => {
    try {
      updateProductSubcategory(subcategoryId, { is_active });
      setSubcategories(getProductSubcategories());
      toast.success(`Product subcategory ${is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to update product subcategory status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Subcategories</h1>
          <p className="mt-2 text-gray-600">Manage subcategories under product categories</p>
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
              <DialogTitle>Add New Product Subcategory</DialogTitle>
              <DialogDescription>
                Create a new subcategory under a product category.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category_id">Parent Category *</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.is_active).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
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
              <Button onClick={handleAddSubcategory}>Add Subcategory</Button>
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
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
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
          <CardTitle>Product Subcategories ({filteredSubcategories.length})</CardTitle>
          <CardDescription>Manage subcategories organized under parent categories</CardDescription>
        </CardHeader>
        <CardContent>
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
              {filteredSubcategories.map((subcategory) => (
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
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSubcategory(subcategory.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredSubcategories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No product subcategories found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingSubcategory} onOpenChange={(open) => !open && setEditingSubcategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product Subcategory</DialogTitle>
            <DialogDescription>
              Update subcategory details and parent category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_category_id">Parent Category *</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.is_active).map((category) => (
                    <SelectItem key={category.id} value={category.id}>
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
            <Button onClick={handleUpdateSubcategory}>Update Subcategory</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}