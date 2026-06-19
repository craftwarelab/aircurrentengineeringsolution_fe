'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
  Plus, Edit, Trash2, Search, Loader2, Eye, EyeOff,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import {
  useFAQs,
  useCreateFAQ,
  useUpdateFAQ,
  useDeleteFAQ,
  useToggleFAQActive,
  usePublishFAQ,
  useUnpublishFAQ,
  type FAQ,
  type CreateFAQRequest,
  type UpdateFAQRequest,
} from '@/lib/hooks/use-faqs';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

const EMPTY_FORM: CreateFAQRequest = {
  question: '',
  answer: '',
  priority: 0,
  is_active: true,
  status: 'draft',
  slug: '',
};

function generateSlug(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

function statusBadgeVariant(status: FAQ['status']): 'default' | 'secondary' | 'outline' {
  if (status === 'active')   return 'default';
  if (status === 'inactive') return 'secondary';
  return 'outline';
}

// ─── Pagination controls ──────────────────────────────────────────────────────
function Pagination({
  page, lastPage, total, limit,
  onPage,
}: {
  page: number; lastPage: number; total: number; limit: number;
  onPage: (p: number) => void;
}) {
  if (lastPage <= 1) return null;
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-border">
      <p className="text-sm text-muted-foreground">
        Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> FAQs
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={() => onPage(1)}        disabled={page === 1}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPage(page - 1)} disabled={page === 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page number pills */}
        {Array.from({ length: lastPage }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
          .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
            acc.push(p);
            return acc;
          }, [])
          .map((p, idx) =>
            p === 'ellipsis' ? (
              <span key={`e${idx}`} className="px-1 text-muted-foreground text-sm">…</span>
            ) : (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => onPage(p as number)}
              >
                {p}
              </Button>
            )
          )}

        <Button variant="outline" size="sm" onClick={() => onPage(page + 1)} disabled={page === lastPage}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPage(lastPage)}  disabled={page === lastPage}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── FAQ form (shared between add/edit dialogs) ───────────────────────────────
function FAQForm({
  formData,
  setFormData,
}: {
  formData: CreateFAQRequest;
  setFormData: (d: CreateFAQRequest) => void;
}) {
  const handleQuestionChange = (q: string) => {
    setFormData({ ...formData, question: q, slug: generateSlug(q) });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="faq_question">Question *</Label>
        <Input
          id="faq_question"
          value={formData.question}
          onChange={(e) => handleQuestionChange(e.target.value)}
          placeholder="Enter the question"
        />
      </div>
      <div>
        <Label htmlFor="faq_answer">Answer *</Label>
        <Textarea
          id="faq_answer"
          value={formData.answer}
          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          placeholder="Enter the answer"
          rows={5}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="faq_priority">Priority</Label>
          <Input
            id="faq_priority"
            type="number"
            min={0}
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
          />
          <p className="text-xs text-muted-foreground mt-1">Lower = shown first</p>
        </div>
        <div>
          <Label htmlFor="faq_status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => setFormData({ ...formData, status: v as FAQ['status'] })}
          >
            <SelectTrigger id="faq_status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="faq_slug">Slug</Label>
          <Input
            id="faq_slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="auto-generated"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="faq_active"
          checked={formData.is_active}
          onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
        />
        <Label htmlFor="faq_active">Active</Label>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FAQsPage() {
  // Filters & pagination — all server-side
  const [page,         setPage]        = useState(1);
  const [searchTerm,   setSearchTerm]  = useState('');
  const [searchInput,  setSearchInput] = useState('');  // debounced separately
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialogs
  const [isAddOpen,    setIsAddOpen]   = useState(false);
  const [editingFAQ,   setEditingFAQ]  = useState<FAQ | null>(null);

  // Delete confirmation dialog
  const [faqToDelete,       setFaqToDelete]       = useState<FAQ | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Form
  const [formData, setFormData] = useState<CreateFAQRequest>(EMPTY_FORM);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: paged, error, isLoading, mutate } = useFAQs(
    page,
    PAGE_SIZE,
    {
      status:  statusFilter !== 'all' ? statusFilter : undefined,
      search:  searchTerm || undefined,
    }
  );

  const faqs     = paged?.data     ?? [];
  const total    = paged?.total    ?? 0;
  const lastPage = paged?.last_page ?? 1;

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { trigger: createFAQ,   isMutating: creating   } = useCreateFAQ();
  const { trigger: updateFAQ,   isMutating: updating   } = useUpdateFAQ();
  const { trigger: deleteFAQ,   isMutating: deleting   } = useDeleteFAQ();
  const { trigger: toggleActive                         } = useToggleFAQActive();
  const { trigger: publishFAQ,  isMutating: publishing } = usePublishFAQ();
  const { trigger: unpublishFAQ                         } = useUnpublishFAQ();

  // ── Helpers ───────────────────────────────────────────────────────────────
  const resetForm = () => setFormData(EMPTY_FORM);

  const goToPage = (p: number) => setPage(Math.max(1, Math.min(p, lastPage)));

  // Server search fires on Enter or after debounce
  const commitSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  // ── CRUD handlers ──────────────────────────────────────────────────────────
  const handleAdd = async () => {
    try {
      await createFAQ({ url: `${process.env.NEXT_PUBLIC_API_URL}/faqs/`, data: formData });
      mutate();
      setIsAddOpen(false);
      resetForm();
      toast.success('FAQ added successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add FAQ');
    }
  };

  const handleUpdate = async () => {
    if (!editingFAQ) return;
    try {
      await updateFAQ({ faqId: editingFAQ.id, data: formData as UpdateFAQRequest });
      mutate();
      setEditingFAQ(null);
      resetForm();
      toast.success('FAQ updated successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update FAQ');
    }
  };

  const handleDelete = (faq: FAQ) => {
    setFaqToDelete(faq);
    setDeleteConfirmText('');
  };

  const confirmDelete = async () => {
    if (!faqToDelete || deleteConfirmText.toLowerCase() !== 'delete') return;
    try {
      await deleteFAQ(String(faqToDelete.id));
      setFaqToDelete(null);
      setDeleteConfirmText('');
      // If deleting last item on page > 1, go back one page
      if (faqs.length === 1 && page > 1) setPage((p) => p - 1);
      else mutate();
      toast.success('FAQ deleted');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete FAQ');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleActive(id);
      mutate();
      toast.success('Status toggled');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await publishFAQ(id);
      mutate();
      toast.success('FAQ published');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to publish FAQ');
    }
  };

  const handleUnpublish = async (id: number) => {
    try {
      await unpublishFAQ(id);
      mutate();
      toast.success('FAQ unpublished');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to unpublish FAQ');
    }
  };

  const openEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer:   faq.answer,
      priority: faq.priority,
      is_active: faq.is_active,
      status:   faq.status,
      slug:     faq.slug || '',
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">FAQs</h1>
          <p className="mt-1 text-gray-600">Manage frequently asked questions</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" /> Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New FAQ</DialogTitle>
              <DialogDescription>Create a new frequently asked question.</DialogDescription>
            </DialogHeader>
            <FAQForm formData={formData} setFormData={setFormData} />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setIsAddOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleAdd} disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Add FAQ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search question or answer..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') commitSearch(searchInput); }}
                onBlur={() => commitSearch(searchInput)}
                className="pl-10"
              />
            </div>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>FAQs {total > 0 && `(${total})`}</CardTitle>
          <CardDescription>
            Page {page} of {lastPage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading FAQs…</span>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              Error loading FAQs: {error.message}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%]">Question</TableHead>
                    <TableHead className="w-[30%]">Answer</TableHead>
                    <TableHead className="w-[8%]">Priority</TableHead>
                    <TableHead className="w-[12%]">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell className="font-medium max-w-xs">
                        <p className="truncate">{faq.question}</p>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate text-muted-foreground text-sm">{faq.answer}</p>
                      </TableCell>
                      <TableCell className="text-center">{faq.priority}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={statusBadgeVariant(faq.status)} className="capitalize">
                            {faq.status}
                          </Badge>
                          {faq.is_active
                            ? <Eye className="h-3.5 w-3.5 text-green-600" />
                            : <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="sm" onClick={() => openEdit(faq)}>
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Publish / Unpublish */}
                          {faq.status !== 'active' && (
                            <Button variant="outline" size="sm" onClick={() => handlePublish(faq.id)} disabled={publishing} title="Publish">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {faq.status === 'active' && (
                            <Button variant="outline" size="sm" onClick={() => handleUnpublish(faq.id)} title="Unpublish">
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Toggle active */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggle(faq.id)}
                            title={faq.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {faq.is_active
                              ? <EyeOff className="h-4 w-4 text-orange-500" />
                              : <Eye className="h-4 w-4 text-green-600" />
                            }
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(faq)}
                            disabled={deleting}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {faqs.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  {searchTerm || statusFilter !== 'all'
                    ? 'No FAQs match your filters.'
                    : 'No FAQs yet. Click "Add FAQ" to create one.'}
                </div>
              )}

              {/* Pagination */}
              <Pagination
                page={page}
                lastPage={lastPage}
                total={total}
                limit={PAGE_SIZE}
                onPage={goToPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingFAQ} onOpenChange={(open) => { if (!open) { setEditingFAQ(null); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>Update the FAQ details.</DialogDescription>
          </DialogHeader>
          <FAQForm formData={formData} setFormData={setFormData} />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setEditingFAQ(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update FAQ
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!faqToDelete}
        onOpenChange={(open) => { if (!open) { setFaqToDelete(null); setDeleteConfirmText(''); } }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete FAQ</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The FAQ will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {faqToDelete && (
              <p className="text-sm text-gray-600 bg-muted/50 rounded-md px-3 py-2 line-clamp-2">
                "{faqToDelete.question}"
              </p>
            )}
            <p className="text-sm text-gray-600">
              To confirm deletion, please type <strong>delete</strong> below:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmDelete(); }}
              placeholder='Type "delete" here'
              className="font-mono"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setFaqToDelete(null); setDeleteConfirmText(''); }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteConfirmText.toLowerCase() !== 'delete' || deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
