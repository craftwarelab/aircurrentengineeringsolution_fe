'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import {
  useTags,
  useCreateTags,
  useUpdateTag,
  useDeleteTag,
  useSearchTags,
  type ProductTag,
  type CreateTagRequest,
  type UpdateTagRequest
} from '@/lib/hooks/use-tags';
import { toast } from 'sonner';

export default function ProductTagsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<ProductTag | null>(null);

  const [formData, setFormData] = useState<CreateTagRequest & { slug?: string }>({
    name: '',
    slug: '',
  });

  // SWR hooks
  const { data: allTags, error: tagsError, isLoading: tagsLoading, mutate: mutateTags } = useTags();
  const { data: searchResults, isLoading: searchLoading } = useSearchTags(searchTerm.trim());

  // API mutation hooks
  const { trigger: createTags, isMutating: creatingTags } = useCreateTags();
  const { trigger: updateTag, isMutating: updatingTag } = useUpdateTag();
  const { trigger: deleteTag, isMutating: deletingTag } = useDeleteTag();

  const isLoading = tagsLoading || (searchTerm.trim() && searchLoading);

  // Determine which data to display
  const displayTags = useMemo(() => {
    let tags;
    if (searchTerm.trim()) {
      tags = searchResults;
    } else {
      tags = allTags;
    }

    // Ensure we always return an array
    return Array.isArray(tags) ? tags : [];
  }, [searchTerm, searchResults, allTags]);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
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

  const handleAddTag = async () => {
    try {
      await createTags([formData.name]);
      mutateTags(); // Refresh the tags list
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Product tag added successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add product tag');
    }
  };

  const handleEditTag = (tag: ProductTag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
    });
  };

  const handleUpdateTag = async () => {
    if (!editingTag) return;

    try {
      await updateTag({ tagId: editingTag.id, data: formData as UpdateTagRequest });
      mutateTags(); // Refresh the tags list
      setEditingTag(null);
      resetForm();
      toast.success('Product tag updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update product tag');
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    if (confirm('Are you sure you want to delete this product tag?')) {
      try {
        await deleteTag(tagId.toString());
        mutateTags(); // Refresh the tags list
        toast.success('Product tag deleted successfully');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to delete product tag');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Tags</h1>
          <p className="mt-2 text-gray-600">Manage tags for products</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product Tag</DialogTitle>
              <DialogDescription>
                Create a new tag for categorizing products.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter tag name"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleAddTag} disabled={creatingTags}>
                {creatingTags && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Add Tag
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Product Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Tags ({displayTags.length})</CardTitle>
          <CardDescription>Manage tags for organizing products</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading tags...</span>
            </div>
          ) : tagsError ? (
            <div className="text-center py-8 text-red-500">
              Error loading tags: {tagsError.message}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayTags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell className="font-medium">{tag.name}</TableCell>
                      <TableCell className="font-mono text-sm">{tag.slug}</TableCell>
                      <TableCell>{new Date(tag.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTag(tag)}
                            disabled={updatingTag}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTag(tag.id)}
                            disabled={deletingTag}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {displayTags.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No product tags found matching the search term.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingTag} onOpenChange={(open) => !open && setEditingTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product Tag</DialogTitle>
            <DialogDescription>
              Update product tag details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_name">Name *</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setEditingTag(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTag} disabled={updatingTag}>
              {updatingTag && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update Tag
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}