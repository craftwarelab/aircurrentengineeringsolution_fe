'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { getCustomerShowcases, addCustomerShowcase, updateCustomerShowcase, deleteCustomerShowcase, type CustomerShowcase } from '@/lib/mockDatabase';
import { toast } from 'sonner';

export default function CustomerShowcasesPage() {
  const [showcases, setShowcases] = useState<CustomerShowcase[]>(getCustomerShowcases());
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingShowcase, setEditingShowcase] = useState<CustomerShowcase | null>(null);

  const [formData, setFormData] = useState({
    company_name: '',
    logo_url: '',
    customer_name: '',
    customer_position: '',
    description: '',
    slug: '',
    position: 0,
    is_active: true,
    status: 'draft' as CustomerShowcase['status'],
  });

  const filteredShowcases = showcases.filter(showcase =>
    showcase.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    showcase.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    showcase.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      company_name: '',
      logo_url: '',
      customer_name: '',
      customer_position: '',
      description: '',
      slug: '',
      position: showcases.length + 1,
      is_active: true,
      status: 'draft',
    });
  };

  const generateSlug = (companyName: string) => {
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleCompanyNameChange = (companyName: string) => {
    setFormData({
      ...formData,
      company_name: companyName,
      slug: generateSlug(companyName),
    });
  };

  const handleAddShowcase = () => {
    try {
      const newShowcase = addCustomerShowcase(formData);
      setShowcases(getCustomerShowcases());
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Customer showcase added successfully');
    } catch (error) {
      toast.error('Failed to add customer showcase');
    }
  };

  const handleEditShowcase = (showcase: CustomerShowcase) => {
    setEditingShowcase(showcase);
    setFormData({
      company_name: showcase.company_name,
      logo_url: showcase.logo_url,
      customer_name: showcase.customer_name || '',
      customer_position: showcase.customer_position || '',
      description: showcase.description || '',
      slug: showcase.slug || '',
      position: showcase.position,
      is_active: showcase.is_active,
      status: showcase.status,
    });
  };

  const handleUpdateShowcase = () => {
    if (!editingShowcase) return;

    try {
      updateCustomerShowcase(editingShowcase.id, formData);
      setShowcases(getCustomerShowcases());
      setEditingShowcase(null);
      resetForm();
      toast.success('Customer showcase updated successfully');
    } catch (error) {
      toast.error('Failed to update customer showcase');
    }
  };

  const handleDeleteShowcase = (showcaseId: string) => {
    if (confirm('Are you sure you want to delete this customer showcase?')) {
      try {
        deleteCustomerShowcase(showcaseId);
        setShowcases(getCustomerShowcases());
        toast.success('Customer showcase deleted successfully');
      } catch (error) {
        toast.error('Failed to delete customer showcase');
      }
    }
  };

  const handleToggleStatus = (showcaseId: string, is_active: boolean) => {
    try {
      updateCustomerShowcase(showcaseId, { is_active });
      setShowcases(getCustomerShowcases());
      toast.success(`Customer showcase ${is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to update customer showcase status');
    }
  };

  const getStatusBadgeVariant = (status: CustomerShowcase['status']) => {
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
          <h1 className="text-3xl font-bold text-gray-900">Customer Showcases</h1>
          <p className="mt-2 text-gray-600">Manage customer testimonials and case studies</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Showcase
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Customer Showcase</DialogTitle>
              <DialogDescription>
                Add a new customer testimonial or case study.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleCompanyNameChange(e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="logo_url">Logo URL *</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Customer Name</Label>
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Customer testimonial or case study description"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated-slug"
                  />
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
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerShowcase['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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
              <Button onClick={handleAddShowcase}>Add Showcase</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Customer Showcases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by company, customer, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Showcases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Showcases ({filteredShowcases.length})</CardTitle>
          <CardDescription>Manage customer testimonials and case studies</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShowcases.map((showcase) => (
                <TableRow key={showcase.id}>
                  <TableCell className="font-medium">{showcase.company_name}</TableCell>
                  <TableCell>
                    {showcase.customer_name && (
                      <div>
                        <div className="font-medium">{showcase.customer_name}</div>
                        {showcase.customer_position && (
                          <div className="text-sm text-gray-500">{showcase.customer_position}</div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {showcase.description || 'No description'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(showcase.status)}>
                      {showcase.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{showcase.position}</TableCell>
                  <TableCell>{new Date(showcase.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditShowcase(showcase)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteShowcase(showcase.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredShowcases.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No customer showcases found matching the search term.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingShowcase} onOpenChange={(open) => !open && setEditingShowcase(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer Showcase</DialogTitle>
            <DialogDescription>
              Update customer showcase details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_company_name">Company Name *</Label>
                <Input
                  id="edit_company_name"
                  value={formData.company_name}
                  onChange={(e) => handleCompanyNameChange(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit_logo_url">Logo URL *</Label>
                <Input
                  id="edit_logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_customer_name">Customer Name</Label>
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
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
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
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <select
                  id="edit_status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerShowcase['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
            <Button variant="outline" onClick={() => { setEditingShowcase(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateShowcase}>Update Showcase</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}