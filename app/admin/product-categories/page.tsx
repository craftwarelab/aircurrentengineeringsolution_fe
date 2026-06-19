'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Search, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useSearchCategories,
  type ProductCategory,
  type CreateCategoryRequest,
  type UpdateCategoryRequest
} from '@/lib/hooks/use-categories';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

function Pagination({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  const last = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (last <= 1) return null;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  return (
    <div className="flex items-center justify-between pt-4 border-t border-border">
      <p className="text-sm text-muted-foreground">Showing <strong>{from}–{to}</strong> of <strong>{total}</strong></p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={() => onPage(1)} disabled={page === 1}><ChevronsLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={() => onPage(page - 1)} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
        {Array.from({ length: last }, (_, i) => i + 1)
          .filter(p => p === 1 || p === last || Math.abs(p - page) <= 1)
          .reduce<(number | 'e')[]>((acc, p, i, arr) => { if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('e'); acc.push(p); return acc; }, [])
          .map((p, i) => p === 'e'
            ? <span key={`e${i}`} className="px-1 text-muted-foreground text-sm">…</span>
            : <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="w-8 h-8 p-0" onClick={() => onPage(p as number)}>{p}</Button>
          )}
        <Button variant="outline" size="sm" onClick={() => onPage(page + 1)} disabled={page === last}><ChevronRight className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={() => onPage(last)} disabled={page === last}><ChevronsRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

export default function ProductCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    slug: '',
    position: 0,
    is_active: true,
  });

  const { data: allCategories, error: categoriesError, isLoading: categoriesLoading, mutate: mutateCategories } = useCategories();
  const { data: searchResults, isLoading: searchLoading } = useSearchCategories(searchTerm.trim());

  const { trigger: createCategory, isMutating: creatingCategory } = useCreateCategory();
  const { trigger: updateCategory, isMutating: updatingCategory } = useUpdateCategory();
  const { trigger: deleteCategory, isMutating: deletingCategory } = useDeleteCategory();

  const filtered = useMemo(() => {
    const list = searchTerm.trim() ? searchResults : allCategories;
    return Array.isArray(list) ? list : [];
  }, [searchTerm, searchResults, allCategories]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const isLoading = categoriesLoading || (!!searchTerm.trim() && searchLoading);

  const handleSearchChange = (v: string) => { setSearchTerm(v); setPage(1); };

  const resetForm = () => {
    setFormData({ name: '', slug: '', position: (allCategories?.length || 0) + 1, is_active: true });
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name, slug: generateSlug(name) });
  };

  const handleAddCategory = async () => {
    try {
      await createCategory({ url: `${process.env.NEXT_PUBLIC_API_URL}/products/categories`, data: formData });
      mutateCategories();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Product category added successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add product category');
    }
  };

  const handleEditCategory = (category: ProductCategory) => {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug, position: category.position, is_active: category.is_active });
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    try {
      await updateCategory({ url: `${process.env.NEXT_PUBLIC_API_URL}/products/categories/${editingCategory.id}`, data: formData as UpdateCategoryRequest });
      mutateCategories();
      setEditingCategory(null);
      resetForm();
      toast.success('Product category updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update product category');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (confirm('Are you sure you want to delete this product category?')) {
      try {
        await deleteCategory(`/products/categories/${categoryId}`);
        mutateCategories();
        toast.success('Product category deleted successfully');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to delete product category');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Categories</h1>
          <p className="mt-2 text-gray-600">Manage categories for products</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product Category</DialogTitle>
              <DialogDescription>Create a new category for organizing products.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Enter category name" />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="auto-generated-slug" />
                <p className="text-sm text-gray-500 mt-1">URL-friendly version of the name</p>
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input id="position" type="number" value={formData.position} onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })} placeholder="0" />
                <p className="text-sm text-gray-500 mt-1">Display order (lower numbers appear first)</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleAddCategory} disabled={creatingCategory}>
                {creatingCategory && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Add Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or slug..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Categories ({filtered.length})</CardTitle>
          <CardDescription>Manage product categories</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /><span>Loading categories...</span>
            </div>
          ) : categoriesError ? (
            <div className="text-center py-8 text-red-500">Error loading categories: {categoriesError.message}</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                      <TableCell>{category.position}</TableCell>
                      <TableCell>
                        <Badge variant={category.is_active ? 'default' : 'secondary'}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)} disabled={updatingCategory}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteCategory(category.id)} disabled={deletingCategory}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {paginated.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm.trim() ? 'No categories match your search.' : 'No product categories found.'}
                </div>
              )}
              <Pagination page={page} total={filtered.length} onPage={setPage} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product Category</DialogTitle>
            <DialogDescription>Update product category details and settings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_name">Name *</Label>
              <Input id="edit_name" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit_slug">Slug</Label>
              <Input id="edit_slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit_position">Position</Label>
              <Input id="edit_position" type="number" value={formData.position} onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="edit_is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
              <Label htmlFor="edit_is_active">Active</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setEditingCategory(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleUpdateCategory} disabled={updatingCategory}>
              {updatingCategory && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
