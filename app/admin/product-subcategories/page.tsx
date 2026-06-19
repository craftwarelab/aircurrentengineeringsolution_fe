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
import { Plus, Edit, Trash2, Search, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  useCreateSubcategory,
  useUpdateSubcategory,
  useDeleteSubcategory,
  type ProductSubcategory,
  type CreateSubcategoryRequest,
  type UpdateSubcategoryRequest
} from '@/lib/hooks/use-subcategories';
import {
  useCategories,
  useCategoryTree,
  type ProductCategory
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

export default function ProductSubcategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<ProductSubcategory | null>(null);

  const [formData, setFormData] = useState<CreateSubcategoryRequest>({
    category_id: 0,
    name: '',
    slug: '',
    position: 0,
    is_active: true,
  });

  const { data: categoryTree, error: subcategoriesError, isLoading: subcategoriesLoading, mutate: mutateSubcategories } = useCategoryTree();
  const { data: allCategories, isLoading: categoriesLoading } = useCategories();

  const { trigger: createSubcategory, isMutating: creatingSubcategory } = useCreateSubcategory();
  const { trigger: updateSubcategory, isMutating: updatingSubcategory } = useUpdateSubcategory();
  const { trigger: deleteSubcategory, isMutating: deletingSubcategory } = useDeleteSubcategory();

  const allSubcategories = useMemo(() => {
    if (!categoryTree) return [];
    return categoryTree.flatMap((category: any) => category.subcategories || []);
  }, [categoryTree]);

  const filtered = useMemo(() => {
    let list = allSubcategories;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((s: ProductSubcategory) =>
        s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') {
      list = list.filter((s: ProductSubcategory) => s.category_id === parseInt(categoryFilter));
    }
    return list;
  }, [allSubcategories, searchTerm, categoryFilter]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const isLoading = subcategoriesLoading || categoriesLoading;

  const handleFilterChange = (search: string, catFilter: string) => {
    setSearchTerm(search);
    setCategoryFilter(catFilter);
    setPage(1);
  };

  const getCategoryName = (categoryId: number) => {
    const cat = allCategories?.find((c: ProductCategory) => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  };

  const resetForm = () => {
    setFormData({ category_id: 0, name: '', slug: '', position: allSubcategories.length + 1, is_active: true });
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name, slug: generateSlug(name) });
  };

  const handleAddSubcategory = async () => {
    if (!formData.category_id) { toast.error('Please select a parent category'); return; }
    try {
      const { category_id, ...subcategoryData } = formData;
      await createSubcategory({ categoryId: category_id, data: subcategoryData });
      mutateSubcategories();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Product subcategory added successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add product subcategory');
    }
  };

  const handleEditSubcategory = (subcategory: ProductSubcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({ category_id: subcategory.category_id, name: subcategory.name, slug: subcategory.slug, position: subcategory.position, is_active: subcategory.is_active });
  };

  const handleUpdateSubcategory = async () => {
    if (!editingSubcategory) return;
    if (!formData.category_id) { toast.error('Please select a parent category'); return; }
    try {
      await updateSubcategory({ subcategoryId: editingSubcategory.id, data: formData as UpdateSubcategoryRequest });
      mutateSubcategories();
      setEditingSubcategory(null);
      resetForm();
      toast.success('Product subcategory updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update product subcategory');
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: number) => {
    if (confirm('Are you sure you want to delete this product subcategory?')) {
      try {
        await deleteSubcategory(subcategoryId.toString());
        mutateSubcategories();
        toast.success('Product subcategory deleted successfully');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to delete product subcategory');
      }
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
            <Button><Plus className="h-4 w-4 mr-2" />Add Subcategory</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product Subcategory</DialogTitle>
              <DialogDescription>Create a new subcategory under a product category.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Parent Category *</Label>
                <Select value={formData.category_id.toString()} onValueChange={(v) => setFormData({ ...formData, category_id: parseInt(v) })}>
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>
                    {allCategories?.filter((c: ProductCategory) => c.is_active).map((c: ProductCategory) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Enter subcategory name" />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="auto-generated-slug" />
                <p className="text-sm text-gray-500 mt-1">URL-friendly version of the name</p>
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input id="position" type="number" value={formData.position} onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })} placeholder="0" />
                <p className="text-sm text-gray-500 mt-1">Display order within category</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="is_active" checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>Cancel</Button>
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
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or slug..."
                  value={searchTerm}
                  onChange={(e) => handleFilterChange(e.target.value, categoryFilter)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Parent Category</Label>
              <Select value={categoryFilter} onValueChange={(v) => handleFilterChange(searchTerm, v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories?.map((c: ProductCategory) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Subcategories ({filtered.length})</CardTitle>
          <CardDescription>Manage subcategories organized under parent categories</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /><span>Loading subcategories...</span>
            </div>
          ) : subcategoriesError ? (
            <div className="text-center py-8 text-red-500">Error loading subcategories: {subcategoriesError.message}</div>
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
                  {paginated.map((subcategory: ProductSubcategory) => (
                    <TableRow key={subcategory.id}>
                      <TableCell className="font-medium">{subcategory.name}</TableCell>
                      <TableCell><Badge variant="outline">{getCategoryName(subcategory.category_id)}</Badge></TableCell>
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
                          <Button variant="outline" size="sm" onClick={() => handleEditSubcategory(subcategory)} disabled={updatingSubcategory}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteSubcategory(subcategory.id)} disabled={deletingSubcategory}>
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
                  {searchTerm || categoryFilter !== 'all' ? 'No subcategories match your filters.' : 'No product subcategories found.'}
                </div>
              )}
              <Pagination page={page} total={filtered.length} onPage={setPage} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingSubcategory} onOpenChange={(open) => !open && setEditingSubcategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product Subcategory</DialogTitle>
            <DialogDescription>Update subcategory details and parent category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Parent Category *</Label>
              <Select value={formData.category_id.toString()} onValueChange={(v) => setFormData({ ...formData, category_id: parseInt(v) })}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {allCategories?.filter((c: ProductCategory) => c.is_active).map((c: ProductCategory) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Switch id="edit_is_active" checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
              <Label htmlFor="edit_is_active">Active</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setEditingSubcategory(null); resetForm(); }}>Cancel</Button>
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
