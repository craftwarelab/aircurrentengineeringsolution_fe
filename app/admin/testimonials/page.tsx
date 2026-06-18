'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
  Plus, Edit, Trash2, Search, Loader2,
  CheckCircle, XCircle, Eye, EyeOff,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import {
  useTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
  useApproveTestimonial,
  useUnapproveTestimonial,
  useToggleTestimonialActive,
  type Testimonial,
  type CreateTestimonialRequest,
  type UpdateTestimonialRequest,
} from '@/lib/hooks/use-testimonials';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

const EMPTY_FORM: CreateTestimonialRequest = {
  message: '',
  customer_name: '',
  customer_position: '',
  company_name: '',
  is_active: true,
  status: 'draft',
};

function statusVariant(status: Testimonial['status']): 'default' | 'secondary' | 'outline' {
  if (status === 'active')   return 'default';
  if (status === 'inactive') return 'secondary';
  return 'outline';
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({
  page, total, pageSize, onPage,
}: { page: number; total: number; pageSize: number; onPage: (p: number) => void }) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  if (lastPage <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-border">
      <p className="text-sm text-muted-foreground">
        Showing <strong>{from}–{to}</strong> of <strong>{total}</strong>
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={() => onPage(1)}         disabled={page === 1}><ChevronsLeft  className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={() => onPage(page - 1)}  disabled={page === 1}><ChevronLeft   className="h-4 w-4" /></Button>
        {Array.from({ length: lastPage }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
          .reduce<(number | 'e')[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('e');
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === 'e'
              ? <span key={`e${i}`} className="px-1 text-muted-foreground text-sm">…</span>
              : <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="w-8 h-8 p-0" onClick={() => onPage(p as number)}>{p}</Button>
          )}
        <Button variant="outline" size="sm" onClick={() => onPage(page + 1)}  disabled={page === lastPage}><ChevronRight  className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={() => onPage(lastPage)}  disabled={page === lastPage}><ChevronsRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

// ─── Shared form ──────────────────────────────────────────────────────────────
function TestimonialForm({
  data, onChange,
}: {
  data: CreateTestimonialRequest;
  onChange: (d: CreateTestimonialRequest) => void;
}) {
  const set = (patch: Partial<CreateTestimonialRequest>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="tf_message">Message *</Label>
        <Textarea id="tf_message" value={data.message} onChange={(e) => set({ message: e.target.value })} rows={4} placeholder="Customer testimonial text" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tf_name">Customer Name *</Label>
          <Input id="tf_name" value={data.customer_name} onChange={(e) => set({ customer_name: e.target.value })} placeholder="John Doe" />
        </div>
        <div>
          <Label htmlFor="tf_pos">Customer Position</Label>
          <Input id="tf_pos" value={data.customer_position ?? ''} onChange={(e) => set({ customer_position: e.target.value })} placeholder="CEO, Manager…" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tf_company">Company Name</Label>
          <Input id="tf_company" value={data.company_name ?? ''} onChange={(e) => set({ company_name: e.target.value })} placeholder="Company Inc." />
        </div>
        <div>
          <Label htmlFor="tf_order">Display Position</Label>
          <Input id="tf_order" type="number" min={0} value={data.position ?? ''} onChange={(e) => set({ position: parseInt(e.target.value) || 0 })} placeholder="auto" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex-1">
          <Label htmlFor="tf_status">Status</Label>
          <Select value={data.status ?? 'draft'} onValueChange={(v) => set({ status: v as Testimonial['status'] })}>
            <SelectTrigger id="tf_status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pt-5">
          <Switch id="tf_active" checked={data.is_active ?? true} onCheckedChange={(c) => set({ is_active: c })} />
          <Label htmlFor="tf_active">Active</Label>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TestimonialsPage() {
  const [page,        setPage]        = useState(1);
  const [searchTerm,  setSearchTerm]  = useState('');
  const [isAddOpen,   setIsAddOpen]   = useState(false);
  const [editingT,    setEditingT]    = useState<Testimonial | null>(null);
  const [toDelete,    setToDelete]    = useState<Testimonial | null>(null);
  const [delConfirm,  setDelConfirm]  = useState('');
  const [formData,    setFormData]    = useState<CreateTestimonialRequest>(EMPTY_FORM);

  const { data: allTestimonials = [], error, isLoading, mutate } = useTestimonials();

  const { trigger: createT,   isMutating: creating  } = useCreateTestimonial();
  const { trigger: updateT,   isMutating: updating  } = useUpdateTestimonial();
  const { trigger: deleteT,   isMutating: deleting  } = useDeleteTestimonial();
  const { trigger: approveT,  isMutating: approving } = useApproveTestimonial();
  const { trigger: unapproveT                        } = useUnapproveTestimonial();
  const { trigger: toggleAct                         } = useToggleTestimonialActive();

  // Client-side search + pagination (API returns all, no pagination endpoint)
  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return allTestimonials;
    return allTestimonials.filter((t) =>
      t.customer_name.toLowerCase().includes(q) ||
      t.company_name?.toLowerCase().includes(q) ||
      t.message.toLowerCase().includes(q)
    );
  }, [allTestimonials, searchTerm]);

  const total    = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearchTerm(v); setPage(1); };

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    try {
      await createT({ url: `${process.env.NEXT_PUBLIC_API_URL}/testimonials/`, data: formData });
      await mutate();
      setIsAddOpen(false);
      setFormData(EMPTY_FORM);
      toast.success('Testimonial added successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add testimonial');
    }
  };

  const handleUpdate = async () => {
    if (!editingT) return;
    // Build update payload — only allowed fields per API docs
    const payload: UpdateTestimonialRequest = {
      message:           formData.message,
      customer_name:     formData.customer_name,
      customer_position: formData.customer_position ?? null,
      company_name:      formData.company_name ?? null,
      position:          formData.position,
      status:            formData.status,
      is_active:         formData.is_active,
    };
    try {
      await updateT({ testimonialId: editingT.id, data: payload });
      await mutate();
      setEditingT(null);
      setFormData(EMPTY_FORM);
      toast.success('Testimonial updated successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update testimonial');
    }
  };

  const confirmDelete = async () => {
    if (!toDelete || delConfirm.toLowerCase() !== 'delete') return;
    try {
      await deleteT(String(toDelete.id));
      await mutate();
      setToDelete(null);
      setDelConfirm('');
      if (page > lastPage) setPage(lastPage);
      toast.success('Testimonial deleted');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete testimonial');
    }
  };

  const handleApproveToggle = async (t: Testimonial) => {
    // Patch only is_approved in the local cache — never re-fetch for this operation
    // so the row never moves position
    const newApproved = !t.is_approved;
    mutate(
      (prev = []) => prev.map((item) =>
        item.id === t.id ? { ...item, is_approved: newApproved } : item
      ),
      false
    );
    try {
      if (t.is_approved) {
        await unapproveT(t.id);
        toast.success('Testimonial unapproved');
      } else {
        await approveT(t.id);
        toast.success('Testimonial approved');
      }
      // Do NOT call mutate() here — background revalidation re-sorts the list
    } catch (err: any) {
      // Roll back the optimistic patch
      mutate(
        (prev = []) => prev.map((item) =>
          item.id === t.id ? { ...item, is_approved: t.is_approved } : item
        ),
        false
      );
      toast.error(err?.response?.data?.message || 'Failed to update approval');
    }
  };

  const handleToggleActive = async (id: number) => {
    const current = allTestimonials.find((t) => t.id === id);
    if (!current) return;
    const newActive = !current.is_active;
    // Patch only is_active — no re-fetch
    mutate(
      (prev = []) => prev.map((item) =>
        item.id === id ? { ...item, is_active: newActive } : item
      ),
      false
    );
    try {
      await toggleAct(id);
      toast.success(newActive ? 'Activated' : 'Deactivated');
      // Do NOT call mutate() here
    } catch (err: any) {
      // Roll back
      mutate(
        (prev = []) => prev.map((item) =>
          item.id === id ? { ...item, is_active: current.is_active } : item
        ),
        false
      );
      toast.error(err?.response?.data?.message || 'Failed to toggle status');
    }
  };

  const openEdit = (t: Testimonial) => {
    setEditingT(t);
    setFormData({
      message:           t.message,
      customer_name:     t.customer_name,
      customer_position: t.customer_position ?? '',
      company_name:      t.company_name ?? '',
      position:          t.position,
      is_active:         t.is_active,
      status:            t.status,
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
          <p className="mt-1 text-gray-600">Manage customer testimonials and reviews</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData(EMPTY_FORM)}>
              <Plus className="h-4 w-4 mr-2" /> Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Testimonial</DialogTitle>
              <DialogDescription>Create a new customer testimonial. Approval must be set separately after creation.</DialogDescription>
            </DialogHeader>
            <TestimonialForm data={formData} onChange={setFormData} />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setIsAddOpen(false); setFormData(EMPTY_FORM); }}>Cancel</Button>
              <Button onClick={handleAdd} disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Add Testimonial
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, company, or message…"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonials {total > 0 && `(${total})`}</CardTitle>
          <CardDescription>Page {page} of {lastPage}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /><span>Loading…</span>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">Error loading testimonials: {error.message}</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[22%]">Customer</TableHead>
                    <TableHead className="w-[30%]">Message</TableHead>
                    <TableHead className="w-[10%]">Approved</TableHead>
                    <TableHead className="w-[14%]">Status</TableHead>
                    <TableHead className="w-[6%]">Pos.</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <p className="font-medium">{t.customer_name}</p>
                        {t.customer_position && <p className="text-xs text-muted-foreground">{t.customer_position}</p>}
                        {t.company_name && <p className="text-xs text-muted-foreground">{t.company_name}</p>}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground line-clamp-2">{t.message}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {t.is_approved
                            ? <CheckCircle className="h-4 w-4 text-green-600" />
                            : <XCircle    className="h-4 w-4 text-red-400" />
                          }
                          <Button
                            variant="outline" size="sm"
                            onClick={() => handleApproveToggle(t)}
                            disabled={approving}
                            className="text-xs h-7 px-2"
                          >
                            {t.is_approved ? 'Unapprove' : 'Approve'}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={statusVariant(t.status)} className="capitalize">{t.status}</Badge>
                          {t.is_active
                            ? <Eye    className="h-3.5 w-3.5 text-green-600" />
                            : <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                          }
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{t.position}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="sm" onClick={() => openEdit(t)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline" size="sm"
                            onClick={() => handleToggleActive(t.id)}
                            title={t.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {t.is_active
                              ? <EyeOff className="h-4 w-4 text-orange-500" />
                              : <Eye    className="h-4 w-4 text-green-600" />
                            }
                          </Button>
                          <Button
                            variant="outline" size="sm"
                            onClick={() => { setToDelete(t); setDelConfirm(''); }}
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

              {paginated.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  {searchTerm ? 'No testimonials match your search.' : 'No testimonials yet.'}
                </div>
              )}

              <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPage={setPage} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingT} onOpenChange={(o) => { if (!o) { setEditingT(null); setFormData(EMPTY_FORM); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
            <DialogDescription>
              Update testimonial details. To change approval, use the Approve / Unapprove button in the table.
            </DialogDescription>
          </DialogHeader>
          <TestimonialForm data={formData} onChange={setFormData} />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setEditingT(null); setFormData(EMPTY_FORM); }}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update Testimonial
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!toDelete}
        onOpenChange={(o) => { if (!o) { setToDelete(null); setDelConfirm(''); } }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Testimonial</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The testimonial will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {toDelete && (
              <p className="text-sm text-gray-600 bg-muted/50 rounded-md px-3 py-2 line-clamp-2">
                "{toDelete.message}"
              </p>
            )}
            <p className="text-sm text-gray-600">
              To confirm deletion, please type <strong>delete</strong> below:
            </p>
            <Input
              value={delConfirm}
              onChange={(e) => setDelConfirm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmDelete(); }}
              placeholder='Type "delete" here'
              className="font-mono"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setToDelete(null); setDelConfirm(''); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={delConfirm.toLowerCase() !== 'delete' || deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete Testimonial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
