'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Search, Loader2, Eye, EyeOff } from 'lucide-react';
import {
  useFAQs,
  useCreateFAQ,
  useUpdateFAQ,
  useDeleteFAQ,
  useToggleFAQActive,
  usePublishFAQ,
  useUnpublishFAQ,
  useUpdateFAQPriority,
  type FAQ,
  type CreateFAQRequest,
  type UpdateFAQRequest
} from '@/lib/hooks/use-faqs';
import { toast } from 'sonner';

export default function FAQsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

  const [formData, setFormData] = useState<CreateFAQRequest>({
    question: '',
    answer: '',
    priority: 0,
    is_active: true,
    status: 'draft',
    slug: '',
  });

  // SWR hooks
  const { data: allFAQs, error: faqsError, isLoading: faqsLoading, mutate: mutateFAQs } = useFAQs();

  // API mutation hooks
  const { trigger: createFAQ, isMutating: creatingFAQ } = useCreateFAQ();
  const { trigger: updateFAQ, isMutating: updatingFAQ } = useUpdateFAQ();
  const { trigger: deleteFAQ, isMutating: deletingFAQ } = useDeleteFAQ();
  const { trigger: toggleActive, isMutating: togglingActive } = useToggleFAQActive();
  const { trigger: publishFAQ, isMutating: publishingFAQ } = usePublishFAQ();
  const { trigger: unpublishFAQ, isMutating: unpublishingFAQ } = useUnpublishFAQ();
  const { trigger: updatePriority, isMutating: updatingPriority } = useUpdateFAQPriority();

  const isLoading = faqsLoading;

  // Determine which data to display
  const displayFAQs = useMemo(() => {
    let faqs;
    if (searchTerm.trim()) {
      // Client-side search since no search API for FAQs
      faqs = allFAQs?.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [];
    } else {
      faqs = allFAQs || [];
    }

    // Ensure we always return an array
    return Array.isArray(faqs) ? faqs : [];
  }, [searchTerm, allFAQs]);

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      priority: (allFAQs?.length || 0) + 1,
      is_active: true,
      status: 'draft',
      slug: '',
    });
  };

  const generateSlug = (question: string) => {
    return question
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50); // Limit slug length
  };

  const handleQuestionChange = (question: string) => {
    setFormData({
      ...formData,
      question,
      slug: generateSlug(question),
    });
  };

  const handleAddFAQ = async () => {
    try {
      await createFAQ({ url: `${process.env.NEXT_PUBLIC_API_URL}/faqs/`, data: formData });
      mutateFAQs(); // Refresh the FAQs list
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('FAQ added successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add FAQ');
    }
  };

  const handleEditFAQ = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      priority: faq.priority,
      is_active: faq.is_active,
      status: faq.status,
      slug: faq.slug || '',
    });
  };

  const handleUpdateFAQ = async () => {
    if (!editingFAQ) return;

    try {
      await updateFAQ({ faqId: editingFAQ.id, data: formData as UpdateFAQRequest });
      mutateFAQs(); // Refresh the FAQs list
      setEditingFAQ(null);
      resetForm();
      toast.success('FAQ updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update FAQ');
    }
  };

  const handleDeleteFAQ = async (faqId: number) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await deleteFAQ(faqId.toString());
        mutateFAQs(); // Refresh the FAQs list
        toast.success('FAQ deleted successfully');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to delete FAQ');
      }
    }
  };

  const handleToggleStatus = async (faqId: number) => {
    try {
      await toggleActive(faqId);
      mutateFAQs(); // Refresh the FAQs list
      toast.success('FAQ status toggled successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to toggle FAQ status');
    }
  };

  const getStatusBadgeVariant = (status: FAQ['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handlePublishFAQ = async (faqId: number) => {
    try {
      await publishFAQ(faqId);
      mutateFAQs(); // Refresh the FAQs list
      toast.success('FAQ published successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to publish FAQ');
    }
  };

  const handleUnpublishFAQ = async (faqId: number) => {
    try {
      await unpublishFAQ(faqId);
      mutateFAQs(); // Refresh the FAQs list
      toast.success('FAQ unpublished successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to unpublish FAQ');
    }
  };

  const handleUpdatePriority = async (faqId: number, priority: number) => {
    try {
      await updatePriority({ faqId, priority });
      mutateFAQs(); // Refresh the FAQs list
      toast.success('FAQ priority updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update FAQ priority');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">FAQs</h1>
          <p className="mt-2 text-gray-600">Manage frequently asked questions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New FAQ</DialogTitle>
              <DialogDescription>
                Add a new frequently asked question and answer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => handleQuestionChange(e.target.value)}
                  placeholder="Enter the question"
                />
              </div>
              <div>
                <Label htmlFor="answer">Answer *</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter the answer"
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">Higher numbers appear first</p>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as FAQ['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated-slug"
                  />
                </div>
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
              <Button onClick={handleAddFAQ} disabled={creatingFAQ}>
                {creatingFAQ && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Add FAQ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search FAQs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by question or answer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQs Table */}
      <Card>
        <CardHeader>
          <CardTitle>FAQs ({displayFAQs.length})</CardTitle>
          <CardDescription>Manage frequently asked questions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading FAQs...</span>
            </div>
          ) : faqsError ? (
            <div className="text-center py-8 text-red-500">
              Error loading FAQs: {faqsError.message}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Answer</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayFAQs.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {faq.question}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {faq.answer}
                      </TableCell>
                      <TableCell>{faq.priority}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(faq.status)}>
                            {faq.status}
                          </Badge>
                          {faq.is_active ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditFAQ(faq)}
                            disabled={updatingFAQ}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {faq.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePublishFAQ(faq.id)}
                              disabled={publishingFAQ}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {faq.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnpublishFAQ(faq.id)}
                              disabled={unpublishingFAQ}
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(faq.id)}
                            disabled={togglingActive}
                          >
                            {faq.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteFAQ(faq.id)}
                            disabled={deletingFAQ}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {displayFAQs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No FAQs found matching the search term.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingFAQ} onOpenChange={(open) => !open && setEditingFAQ(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>
              Update FAQ details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_question">Question *</Label>
              <Input
                id="edit_question"
                value={formData.question}
                onChange={(e) => handleQuestionChange(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit_answer">Answer *</Label>
              <Textarea
                id="edit_answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                rows={6}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_priority">Priority</Label>
                <Input
                  id="edit_priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <select
                  id="edit_status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as FAQ['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
            <Button variant="outline" onClick={() => { setEditingFAQ(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFAQ} disabled={updatingFAQ}>
              {updatingFAQ && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update FAQ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}