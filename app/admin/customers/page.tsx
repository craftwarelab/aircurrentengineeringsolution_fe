'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Star, Search, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useToggleCustomerActive,
  useToggleCustomerFeatured,
  type Customer,
} from '@/lib/hooks/use-customers';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';

const CLOUDINARY_BASE = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/`;

const emptyForm = {
  company_name: '',
  short_description: '',
  slug: '',
  position: '',
  is_active: true,
  is_featured: false,
};

export default function AdminCustomers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const itemsPerPage = 10;

  const { data: response, isLoading, error, mutate } = useCustomers(currentPage, itemsPerPage, search || undefined);

  // Hook uses a custom fetcher returning the full { success, data, total, last_page } body
  const customers: Customer[] = response?.data ?? [];
  const total: number = response?.total ?? 0;
  const totalPages: number = response?.last_page ?? 1;

  const { trigger: createCustomer, isMutating: creating } = useCreateCustomer();
  const { trigger: updateCustomer, isMutating: updating } = useUpdateCustomer();
  const { trigger: deleteCustomer } = useDeleteCustomer();
  const { trigger: toggleActive } = useToggleCustomerActive();
  const { trigger: toggleFeatured } = useToggleCustomerFeatured();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setLogoFile(null);
    setLogoPreview(null);
    setEditingCustomer(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      company_name: customer.company_name,
      short_description: customer.short_description ?? '',
      slug: customer.slug ?? '',
      position: String(customer.position),
      is_active: customer.is_active,
      is_featured: customer.is_featured,
    });
    setLogoFile(null);
    setLogoPreview(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCustomer && !logoFile) {
      toast.error('Logo image is required');
      return;
    }

    setIsProgressOpen(true);
    setProgressStatus(editingCustomer ? 'Updating customer...' : 'Creating customer...');

    try {
      const fd = new FormData();
      fd.append('company_name', formData.company_name);
      if (formData.short_description) fd.append('short_description', formData.short_description);
      if (formData.slug) fd.append('slug', formData.slug);
      if (formData.position !== '') fd.append('position', formData.position);
      fd.append('is_active', String(formData.is_active));
      fd.append('is_featured', String(formData.is_featured));
      if (logoFile) fd.append('image', logoFile);

      if (editingCustomer) {
        await updateCustomer({ id: editingCustomer.id, data: fd });
        setProgressStatus('Customer updated successfully!');
      } else {
        await createCustomer(fd);
        setProgressStatus('Customer created successfully!');
      }

      mutate();
      setIsDialogOpen(false);
      resetForm();
      toast.success(editingCustomer ? 'Customer updated successfully' : 'Customer created successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save customer');
    } finally {
      setTimeout(() => {
        setIsProgressOpen(false);
        setProgressStatus('');
      }, 1000);
    }
  };

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteConfirmText('');
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete || deleteConfirmText.toLowerCase() !== 'delete') {
      toast.error('Please type "delete" to confirm');
      return;
    }
    setIsDeleteDialogOpen(false);
    setIsProgressOpen(true);
    setProgressStatus('Deleting customer...');
    try {
      await deleteCustomer(customerToDelete.id);
      mutate();
      setProgressStatus('Deleted successfully!');
      toast.success('Customer deleted successfully');
    } catch {
      toast.error('Failed to delete customer');
    } finally {
      setTimeout(() => {
        setIsProgressOpen(false);
        setProgressStatus('');
        setCustomerToDelete(null);
      }, 800);
    }
  };

  const handleToggleActive = async (customer: Customer) => {
    try {
      await toggleActive(customer.id);
      mutate();
      toast.success(`Customer ${customer.is_active ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Failed to toggle active status');
    }
  };

  const handleToggleFeatured = async (customer: Customer) => {
    try {
      await toggleFeatured(customer.id);
      mutate();
      toast.success(`Customer ${customer.is_featured ? 'unfeatured' : 'featured'}`);
    } catch {
      toast.error('Failed to toggle featured status');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="mt-2 text-gray-600">Manage companies and partners that work with us</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
              <DialogDescription>
                {editingCustomer ? 'Update customer details.' : 'Add a new customer/partner.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 max-h-[65vh] overflow-y-auto py-2 pr-1">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

                  <div>
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({
                        ...formData,
                        company_name: e.target.value,
                        slug: formData.slug || generateSlug(e.target.value),
                      })}
                      placeholder="TechCorp Solutions"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="short_description">Short Description</Label>
                    <Textarea
                      id="short_description"
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      placeholder="Brief description for the card"
                      rows={2}
                      maxLength={500}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="techcorp-solutions"
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        type="number"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
                    Company Logo {!editingCustomer && '*'}
                  </h3>

                  {editingCustomer && !logoPreview && editingCustomer.logo_public_id && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                      <img
                        src={`${CLOUDINARY_BASE}${editingCustomer.logo_public_id}`}
                        alt={editingCustomer.company_name}
                        className="h-14 w-24 object-contain rounded"
                      />
                      <p className="text-sm text-gray-500">Current logo — upload a new file to replace</p>
                    </div>
                  )}

                  {logoPreview && (
                    <div className="relative inline-flex">
                      <img src={logoPreview} alt="Preview" className="h-20 w-36 object-contain border rounded-lg bg-gray-50 p-1" />
                      <button
                        type="button"
                        onClick={() => { setLogoFile(null); setLogoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Click to upload logo (JPEG/PNG/WebP, max 2MB)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>

                {/* Settings */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Settings</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Active</Label>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_featured">Featured (shown on home page)</Label>
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(v) => setFormData({ ...formData, is_featured: v })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating || updating}>
                  {(creating || updating) ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Create Customer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by company name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="outline">Search</Button>
            {search && (
              <Button type="button" variant="ghost" onClick={() => { setSearch(''); setSearchInput(''); setCurrentPage(1); }}>
                Clear
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers ({total})</CardTitle>
          <CardDescription>Companies and partners associated with Air Current Engineering</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              <span className="ml-3 text-gray-600">Loading customers...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Error loading customers</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        {customer.logo_public_id ? (
                          <img
                            src={getCloudinaryImageUrl(customer.logo_public_id, { width: 80, height: 40, crop: 'scale' })}
                            alt={customer.company_name}
                            className="h-10 w-20 object-contain rounded border bg-gray-50 p-1"
                          />
                        ) : (
                          <div className="h-10 w-20 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">
                            No logo
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div>{customer.company_name}</div>
                          {customer.slug && (
                            <div className="text-xs text-gray-400 font-mono">/{customer.slug}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span className="text-sm text-gray-500 line-clamp-2">
                          {customer.short_description || '—'}
                        </span>
                      </TableCell>
                      <TableCell>{customer.position}</TableCell>
                      <TableCell>
                        <Switch
                          checked={customer.is_active}
                          onCheckedChange={() => handleToggleActive(customer)}
                        />
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleToggleFeatured(customer)}
                          className={`transition-colors ${customer.is_featured ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                          title={customer.is_featured ? 'Unfeature' : 'Feature'}
                        >
                          <Star className="h-5 w-5 fill-current" />
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenEdit(customer)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(customer)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {customers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No customers found. Add your first customer above.
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages} — {total} total
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)} className="min-w-[36px]">
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{customerToDelete?.company_name}</strong> and its logo from Cloudinary. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-gray-600">Type <strong>delete</strong> to confirm:</p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder='Type "delete" here'
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteConfirmText.toLowerCase() !== 'delete'}>
              Delete Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Dialog */}
      <Dialog open={isProgressOpen} onOpenChange={setIsProgressOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Processing</DialogTitle>
            <DialogDescription>{progressStatus}</DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
