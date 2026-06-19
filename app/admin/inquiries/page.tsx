'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Eye, Mail, Phone, MapPin, Building2, Calendar, DollarSign, Search, Loader2, Trash2 } from 'lucide-react';
import {
  useInquiries,
  useUpdateInquiryStatus,
  useUpdateInquiry,
  useDeleteInquiry,
  type Inquiry,
} from '@/lib/hooks/use-inquiries';
import api from '@/lib/api';
import { toast } from 'sonner';

const STATUS_COLORS: Record<Inquiry['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
  new: 'default',
  pending: 'secondary',
  contacted: 'outline',
  in_progress: 'secondary',
  completed: 'outline',
  cancelled: 'destructive',
};

const STATUS_OPTIONS: Inquiry['status'][] = ['new', 'pending', 'contacted', 'in_progress', 'completed', 'cancelled'];

export default function AdminInquiries() {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: inquiries, isLoading, error, mutate } = useInquiries();
  const { trigger: updateStatus, isMutating: updatingStatus } = useUpdateInquiryStatus();
  const { trigger: updateInquiry, isMutating: updatingInquiry } = useUpdateInquiry();
  const { trigger: deleteInquiry, isMutating: deletingInquiry } = useDeleteInquiry();

  const displayInquiries = useMemo(() => {
    const list = Array.isArray(inquiries) ? inquiries : [];
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(
      (i) =>
        i.full_name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.project_location.toLowerCase().includes(q) ||
        i.company_name?.toLowerCase().includes(q)
    );
  }, [inquiries, searchTerm]);

  const handleStatusChange = async (inquiry: Inquiry, status: Inquiry['status']) => {
    try {
      await updateStatus({ id: inquiry.id, data: { status } });
      mutate();
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    }
  };

  const handleViewInquiry = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setInternalNotes('');
    setDetailLoading(true);
    try {
      const res = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/inquiries/${inquiry.id}`);
      const full: Inquiry = res.data.data;
      setSelectedInquiry(full);
      setInternalNotes(full.internal_notes || '');
      if (full.status === 'new') handleStatusChange(full, 'pending');
    } catch {
      toast.error('Failed to load inquiry details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    try {
      await updateInquiry({
        id: selectedInquiry.id,
        data: { internal_notes: internalNotes },
      });
      mutate();
      setSelectedInquiry(null);
      toast.success('Notes saved successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save notes');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await deleteInquiry(id);
      mutate();
      toast.success('Inquiry deleted');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete inquiry');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
        <p className="mt-2 text-gray-600">Manage project inquiries and quote requests</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, company or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Inquiries ({displayInquiries.length})</CardTitle>
          <CardDescription>View and manage all project inquiry submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading inquiries...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Error loading inquiries: {error.message}</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        <div className="font-medium">{inquiry.full_name}</div>
                        {inquiry.company_name && (
                          <div className="text-sm text-gray-500">{inquiry.company_name}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {inquiry.email}
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Phone className="h-3 w-3" /> {inquiry.phone_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{inquiry.project_location}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {inquiry.service_types.slice(0, 2).map((s) => (
                            <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                          {inquiry.service_types.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{inquiry.service_types.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={inquiry.status}
                          onValueChange={(v) => handleStatusChange(inquiry, v as Inquiry['status'])}
                          disabled={updatingStatus}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleViewInquiry(inquiry)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(inquiry.id)}
                            disabled={deletingInquiry}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {displayInquiries.length === 0 && (
                <div className="text-center py-8 text-gray-500">No inquiries found</div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              Submitted by {selectedInquiry?.full_name} on{' '}
              {selectedInquiry ? new Date(selectedInquiry.created_at).toLocaleString() : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-5">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Full Name</Label>
                  <p className="text-sm font-medium">{selectedInquiry.full_name}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Email</Label>
                  <p className="text-sm">{selectedInquiry.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</Label>
                  <p className="text-sm">{selectedInquiry.phone_number}</p>
                </div>
                {selectedInquiry.company_name && (
                  <div>
                    <Label className="text-xs text-gray-500 flex items-center gap-1"><Building2 className="h-3 w-3" /> Company</Label>
                    <p className="text-sm">{selectedInquiry.company_name}</p>
                  </div>
                )}
              </div>

              {/* Project Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</Label>
                  <p className="text-sm">{selectedInquiry.project_location}</p>
                </div>
                {selectedInquiry.expected_timeline && (
                  <div>
                    <Label className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" /> Timeline</Label>
                    <p className="text-sm">{selectedInquiry.expected_timeline}</p>
                  </div>
                )}
                {selectedInquiry.estimated_budget && (
                  <div>
                    <Label className="text-xs text-gray-500 flex items-center gap-1"><DollarSign className="h-3 w-3" /> Budget</Label>
                    <p className="text-sm">{selectedInquiry.estimated_budget}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <Badge variant={STATUS_COLORS[selectedInquiry.status]} className="mt-1">
                    {selectedInquiry.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Badge>
                </div>
              </div>

              {/* Services */}
              <div>
                <Label className="text-xs text-gray-500">Service Types</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedInquiry.service_types.map((s) => (
                    <Badge key={s} variant="outline">{s}</Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-xs text-gray-500">Project Description</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md min-h-[60px]">
                  {detailLoading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Loader2 className="h-3 w-3 animate-spin" /> Loading details...
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedInquiry.project_description || 'No description provided'}
                    </p>
                  )}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <Label htmlFor="internal_notes" className="text-xs text-gray-500">Internal Notes</Label>
                <Textarea
                  id="internal_notes"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                  placeholder="Add internal notes visible only to the team..."
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedInquiry(null)}>Close</Button>
                <Button onClick={handleSaveNotes} disabled={updatingInquiry}>
                  {updatingInquiry && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
