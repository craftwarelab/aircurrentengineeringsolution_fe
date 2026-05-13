'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { getProjectTags, addProjectTag, updateProjectTag, deleteProjectTag, type ProjectTag } from '@/lib/mockDatabase';
import { toast } from 'sonner';

export default function ProjectTagsPage() {
  const [tags, setTags] = useState<ProjectTag[]>(getProjectTags());
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<ProjectTag | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleAddTag = () => {
    try {
      const newTag = addProjectTag(formData);
      setTags(getProjectTags());
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Project tag added successfully');
    } catch (error) {
      toast.error('Failed to add project tag');
    }
  };

  const handleEditTag = (tag: ProjectTag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
    });
  };

  const handleUpdateTag = () => {
    if (!editingTag) return;

    try {
      updateProjectTag(editingTag.id, formData);
      setTags(getProjectTags());
      setEditingTag(null);
      resetForm();
      toast.success('Project tag updated successfully');
    } catch (error) {
      toast.error('Failed to update project tag');
    }
  };

  const handleDeleteTag = (tagId: string) => {
    if (confirm('Are you sure you want to delete this project tag?')) {
      try {
        deleteProjectTag(tagId);
        setTags(getProjectTags());
        toast.success('Project tag deleted successfully');
      } catch (error) {
        toast.error('Failed to delete project tag');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Tags</h1>
          <p className="mt-2 text-gray-600">Manage tags for projects</p>
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
              <DialogTitle>Add New Project Tag</DialogTitle>
              <DialogDescription>
                Create a new tag for categorizing projects.
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
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleAddTag}>Add Tag</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Project Tags</CardTitle>
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
          <CardTitle>Project Tags ({filteredTags.length})</CardTitle>
          <CardDescription>Manage tags for organizing projects</CardDescription>
        </CardHeader>
        <CardContent>
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
              {filteredTags.map((tag) => (
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
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTag(tag.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredTags.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No project tags found matching the search term.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingTag} onOpenChange={(open) => !open && setEditingTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project Tag</DialogTitle>
            <DialogDescription>
              Update project tag details.
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
            <div>
              <Label htmlFor="edit_slug">Slug</Label>
              <Input
                id="edit_slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setEditingTag(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTag}>Update Tag</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}