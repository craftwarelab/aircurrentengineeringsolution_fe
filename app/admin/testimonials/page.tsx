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
import { Plus, Edit, Trash2, Search, Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import {
  useTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
  useApproveTestimonial,
  useUnapproveTestimonial,
  useToggleTestimonialActive,
  useUpdateTestimonialPosition,
  type Testimonial,
  type CreateTestimonialRequest,
  type UpdateTestimonialRequest
} from '@/lib/hooks/use-testimonials';
import { toast } from 'sonner';

export default function TestimonialsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const [formData, setFormData] = useState<CreateTestimonialRequest>({
    message: '',
    customer_name: '',
    customer_position: '',
    company_name: '',
    is_approved: false,
    is_active: true,
    status: 'draft',
  });

  // SWR hooks
  const { data: allTestimonials, error: testimonialsError, isLoading: testimonialsLoading, mutate: mutateTestimonials } = useTestimonials();

  // API mutation hooks
  const { trigger: createTestimonial, isMutating: creatingTestimonial } = useCreateTestimonial();
  const { trigger: updateTestimonial, isMutating: updatingTestimonial } = useUpdateTestimonial();
  const { trigger: deleteTestimonial, isMutating: deletingTestimonial } = useDeleteTestimonial();
  const { trigger: approveTestimonial, isMutating: approvingTestimonial } = useApproveTestimonial();
  const { trigger: unapproveTestimonial, isMutating: unapprovingTestimonial } = useUnapproveTestimonial();
  const { trigger: toggleActive, isMutating: togglingActive } = useToggleTestimonialActive();
  const { trigger: updatePosition, isMutating: updatingPosition } = useUpdateTestimonialPosition();

  const isLoading = testimonialsLoading;

  // Determine which data to display
  const displayTestimonials = useMemo(() => {
    let testimonials;
    if (searchTerm.trim()) {
      // Client-side search since no search API for testimonials
      testimonials = allTestimonials?.filter(testimonial =>
        testimonial.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.message.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [];
    } else {
      testimonials = allTestimonials || [];
    }

    // Ensure we always return an array
    return Array.isArray(testimonials) ? testimonials : [];
  }, [searchTerm, allTestimonials]);

  const resetForm = () => {
    setFormData({
      message: '',
      customer_name: '',
      customer_position: '',
      company_name: '',
      is_approved: false,
      is_active: true,
      position: (allTestimonials?.length || 0) + 1,
      status: 'draft',
    });
  };

  const handleAddTestimonial = async () => {
    try {
      await createTestimonial({ url: `${process.env.NEXT_PUBLIC_API_URL}/testimonials/`, data: formData });
      mutateTestimonials(); // Refresh the testimonials list
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Testimonial added successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add testimonial');
    }
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      message: testimonial.message,
      customer_name: testimonial.customer_name,
      customer_position: testimonial.customer_position || '',
      company_name: testimonial.company_name || '',
      is_approved: testimonial.is_approved,
      is_active: testimonial.is_active,
      position: testimonial.position,
      status: testimonial.status,
    });
  };

  const handleUpdateTestimonial = async () => {
    if (!editingTestimonial) return;

    try {
      await updateTestimonial({ testimonialId: editingTestimonial.id, data: formData as UpdateTestimonialRequest });
      mutateTestimonials(); // Refresh the testimonials list
      setEditingTestimonial(null);
      resetForm();
      toast.success('Testimonial updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update testimonial');
    }
  };

  const handleDeleteTestimonial = async (testimonialId: number) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await deleteTestimonial(testimonialId.toString());
        mutateTestimonials(); // Refresh the testimonials list
        toast.success('Testimonial deleted successfully');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to delete testimonial');
      }
    }
  };

  const handleToggleApproval = async (testimonialId: number, is_approved: boolean) => {
    try {
      if (is_approved) {
        await approveTestimonial(testimonialId);
        toast.success('Testimonial approved successfully');
      } else {
        await unapproveTestimonial(testimonialId);
        toast.success('Testimonial unapproved successfully');
      }
      mutateTestimonials(); // Refresh the testimonials list
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update testimonial approval');
    }
  };

  const handleToggleStatus = async (testimonialId: number) => {
    try {
      await toggleActive(testimonialId);
      mutateTestimonials(); // Refresh the testimonials list
      toast.success('Testimonial status toggled successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to toggle testimonial status');
    }
  };

  const getStatusBadgeVariant = (status: Testimonial['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
          <p className="mt-2 text-gray-600">Manage customer testimonials and reviews</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Testimonial</DialogTitle>
              <DialogDescription>
                Add a new customer testimonial or review.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Customer testimonial message"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Customer Name *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_position">Customer Position</Label>
                  <Input
                    id="customer_position"
                    value={formData.customer_position}
                    onChange={(e) => setFormData({ ...formData, customer_position: e.target.value })}
                    placeholder="CEO, Manager, etc."
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Company Inc."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    type="number"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Testimonial['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_approved"
                    checked={formData.is_approved}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_approved: checked })}
                  />
                  <Label htmlFor="is_approved">Approved</Label>
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
              <Button onClick={handleAddTestimonial} disabled={creatingTestimonial}>
                {creatingTestimonial && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Add Testimonial
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Testimonials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by customer name, company, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Testimonials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonials ({displayTestimonials.length})</CardTitle>
          <CardDescription>Manage customer testimonials and reviews</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading testimonials...</span>
            </div>
          ) : testimonialsError ? (
            <div className="text-center py-8 text-red-500">
              Error loading testimonials: {testimonialsError.message}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayTestimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{testimonial.customer_name}</div>
                          {testimonial.customer_position && (
                            <div className="text-sm text-gray-500">{testimonial.customer_position}</div>
                          )}
                          {testimonial.company_name && (
                            <div className="text-sm text-gray-500">{testimonial.company_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {testimonial.message}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {testimonial.is_approved ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleApproval(testimonial.id, !testimonial.is_approved)}
                            disabled={approvingTestimonial || unapprovingTestimonial}
                          >
                            {testimonial.is_approved ? 'Unapprove' : 'Approve'}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(testimonial.status)}>
                            {testimonial.status}
                          </Badge>
                          {testimonial.is_active ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{testimonial.position}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTestimonial(testimonial)}
                            disabled={updatingTestimonial}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(testimonial.id)}
                            disabled={togglingActive}
                          >
                            {testimonial.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTestimonial(testimonial.id)}
                            disabled={deletingTestimonial}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {displayTestimonials.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No testimonials found matching the search term.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingTestimonial} onOpenChange={(open) => !open && setEditingTestimonial(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
            <DialogDescription>
              Update testimonial details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_message">Message *</Label>
              <Textarea
                id="edit_message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_customer_name">Customer Name *</Label>
                <Input
                  id="edit_customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_customer_position">Customer Position</Label>
                <Input
                  id="edit_customer_position"
                  value={formData.customer_position}
                  onChange={(e) => setFormData({ ...formData, customer_position: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_company_name">Company Name</Label>
              <Input
                id="edit_company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_position">Position</Label>
                <Input
                  id="edit_position"
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <select
                  id="edit_status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Testimonial['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="edit_is_approved"
                  checked={formData.is_approved}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_approved: checked })}
                />
                <Label htmlFor="edit_is_approved">Approved</Label>
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
            <Button variant="outline" onClick={() => { setEditingTestimonial(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTestimonial} disabled={updatingTestimonial}>
              {updatingTestimonial && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update Testimonial
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}