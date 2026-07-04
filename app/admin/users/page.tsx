'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Plus, Edit, Trash2, Search, Loader2, Eye, EyeOff,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Users, ShieldCheck, UserX,
} from 'lucide-react';
import {
  useUsers, useUserCount, useCreateUser, useUpdateUser,
  useToggleUserStatus, useDeleteUser,
  type AdminUser, type CreateUserRequest, type UpdateUserRequest,
} from '@/lib/hooks/use-users';
import { AuthUtils } from '@/lib/auth';
import { toast } from 'sonner';

const ROLES = ['guest', 'user', 'employee', 'manager', 'admin'] as const;
const PAGE_SIZE = 20;

const ROLE_COLORS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  superAdmin: 'default',
  admin:      'default',
  manager:    'secondary',
  employee:   'outline',
  user:       'outline',
  guest:      'outline',
};

const EMPTY_FORM: CreateUserRequest = {
  first_name: '', last_name: '', email: '', password: '',
  mobile_number: '', country: '', address_line_1: '',
  address_line_2: '', role: 'admin', is_active: true,
};

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ offset, limit, total, onOffset }: {
  offset: number; limit: number; total: number; onOffset: (o: number) => void;
}) {
  const lastOffset = Math.max(0, Math.floor((total - 1) / limit) * limit);
  if (total <= limit) return null;
  const from = offset + 1;
  const to   = Math.min(offset + limit, total);
  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <p className="text-sm text-muted-foreground">Showing <strong>{from}–{to}</strong> of <strong>{total}</strong></p>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" onClick={() => onOffset(0)}                   disabled={offset === 0}><ChevronsLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={() => onOffset(offset - limit)}      disabled={offset === 0}><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={() => onOffset(offset + limit)}      disabled={offset >= lastOffset}><ChevronRight className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={() => onOffset(lastOffset)}          disabled={offset >= lastOffset}><ChevronsRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

// ─── User Form ────────────────────────────────────────────────────────────────
function UserForm({
  data, onChange, isEdit = false,
}: {
  data: CreateUserRequest;
  onChange: (d: CreateUserRequest) => void;
  isEdit?: boolean;
}) {
  const set = (patch: Partial<CreateUserRequest>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>First Name *</Label>
          <Input value={data.first_name} onChange={(e) => set({ first_name: e.target.value })} placeholder="Jane" />
        </div>
        <div>
          <Label>Last Name *</Label>
          <Input value={data.last_name} onChange={(e) => set({ last_name: e.target.value })} placeholder="Smith" />
        </div>
      </div>
      <div>
        <Label>Email *</Label>
        <Input type="email" value={data.email} onChange={(e) => set({ email: e.target.value })} placeholder="jane@company.com" />
      </div>
      {!isEdit && (
        <div>
          <Label>Password *</Label>
          <Input type="password" value={data.password} onChange={(e) => set({ password: e.target.value })} placeholder="Min 8 characters" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Mobile Number *</Label>
          <Input value={data.mobile_number} onChange={(e) => set({ mobile_number: e.target.value })} placeholder="+94 77 123 4567" />
        </div>
        <div>
          <Label>Country *</Label>
          <Input value={data.country} onChange={(e) => set({ country: e.target.value })} placeholder="Sri Lanka" />
        </div>
      </div>
      <div>
        <Label>Address Line 1 *</Label>
        <Input value={data.address_line_1} onChange={(e) => set({ address_line_1: e.target.value })} placeholder="123 Main Street" />
      </div>
      <div>
        <Label>Address Line 2</Label>
        <Input value={data.address_line_2 ?? ''} onChange={(e) => set({ address_line_2: e.target.value })} placeholder="Apt 4B (optional)" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Role</Label>
          <Select
            value={String(data.role || 'admin')}
            onValueChange={(v) => set({ role: v as CreateUserRequest['role'] })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Switch checked={data.is_active ?? true} onCheckedChange={(c) => set({ is_active: c })} id="user_active" />
          <Label htmlFor="user_active">Active</Label>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const currentUser = AuthUtils.getUser();

  // Guard — only superAdmin
  if (currentUser?.role !== 'superAdmin') {
    return (
      <div className="flex items-center justify-center py-24 text-center">
        <div>
          <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Access Restricted</h2>
          <p className="text-muted-foreground mt-2">Only superAdmin can access user management.</p>
        </div>
      </div>
    );
  }

  const [offset,       setOffset]       = useState(0);
  const [search,       setSearch]       = useState('');
  const [searchInput,  setSearchInput]  = useState('');
  const [roleFilter,   setRoleFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddOpen,    setIsAddOpen]    = useState(false);
  const [editingUser,  setEditingUser]  = useState<AdminUser | null>(null);
  const [toDelete,     setToDelete]     = useState<AdminUser | null>(null);
  const [delConfirm,   setDelConfirm]   = useState('');
  const [formData,     setFormData]     = useState<CreateUserRequest>(EMPTY_FORM);

  const { data: usersRes, isLoading, error, mutate } = useUsers(
    PAGE_SIZE, offset, search || undefined,
    roleFilter !== 'all' ? roleFilter : undefined,
    statusFilter !== 'all' ? statusFilter === 'active' : undefined,
  );

  const { data: totalCount,    mutate: mutateTotalCount    } = useUserCount();
  const { data: adminCount,    mutate: mutateAdminCount    } = useUserCount('admin');
  const { data: inactiveCount, mutate: mutateInactiveCount } = useUserCount(undefined, false);

  // Revalidate all stat cards at once
  const mutateAllCounts = () => {
    mutateTotalCount();
    mutateAdminCount();
    mutateInactiveCount();
  };

  const { trigger: createUser,  isMutating: creating  } = useCreateUser();
  const { trigger: updateUser,  isMutating: updating  } = useUpdateUser();
  const { trigger: toggleStatus                        } = useToggleUserStatus();
  const { trigger: deleteUser,  isMutating: deleting  } = useDeleteUser();

  const users     = usersRes?.data?.users     ?? [];
  const total     = usersRes?.data?.pagination?.total ?? 0;

  const commitSearch = (v: string) => { setSearch(v); setOffset(0); };
  const handleFilterChange = (role: string, status: string) => {
    setRoleFilter(role); setStatusFilter(status); setOffset(0);
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    const res = await createUser(formData);
    if (res?.success) {
      await mutate();
      mutateAllCounts();
      setIsAddOpen(false);
      setFormData(EMPTY_FORM);
      toast.success('User created successfully');
    } else {
      toast.error(res?.message || 'Failed to create user');
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    const payload: UpdateUserRequest = {
      first_name:    formData.first_name,
      last_name:     formData.last_name,
      email:         formData.email,
      mobile_number: formData.mobile_number,
      country:       formData.country,
      address_line_1: formData.address_line_1,
      address_line_2: formData.address_line_2 || null,
      role:          formData.role,
      is_active:     formData.is_active,
    };
    const res = await updateUser({ id: editingUser.id, data: payload });
    if (res?.success) {
      await mutate();
      setEditingUser(null);
      setFormData(EMPTY_FORM);
      toast.success('User updated successfully');
    } else {
      toast.error(res?.message || 'Failed to update user');
    }
  };

  const handleToggle = async (user: AdminUser) => {
    // Optimistic
    mutate(
      (prev: any) => prev ? {
        ...prev,
        data: { ...prev.data, users: prev.data.users.map((u: AdminUser) => u.id === user.id ? { ...u, is_active: !u.is_active } : u) }
      } : prev,
      false
    );
    const res = await toggleStatus({ id: user.id, is_active: !user.is_active });
    if (!res?.success) {
      mutate(); // revert on error
      toast.error(res?.message || 'Failed to toggle status');
    } else {
      toast.success(res.message);
      mutateInactiveCount(); // disabled count changes on every toggle
    }
  };

  const confirmDelete = async () => {
    if (!toDelete || delConfirm.toLowerCase() !== 'delete') return;
    const res = await deleteUser(toDelete.id);
    if (res?.success) {
      await mutate();
      mutateAllCounts();
      setToDelete(null);
      setDelConfirm('');
      toast.success('User deleted');
    } else {
      toast.error(res?.message || 'Failed to delete user');
    }
  };

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      first_name:    user.first_name,
      last_name:     user.last_name,
      email:         user.email,
      password:      '',
      mobile_number: user.mobile_number ?? '',
      country:       user.country ?? '',
      address_line_1: user.address_line_1 ?? '',
      address_line_2: user.address_line_2 ?? '',
      role:          user.role === 'superAdmin' ? 'admin' : user.role,
      is_active:     user.is_active,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-gray-600">superAdmin only — manage all system users</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData(EMPTY_FORM)}>
              <Plus className="h-4 w-4 mr-2" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Create a new user account and assign a role.</DialogDescription>
            </DialogHeader>
            <UserForm data={formData} onChange={setFormData} />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{totalCount?.data?.count ?? '—'}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{adminCount?.data?.count ?? '—'}</p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <UserX className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{inactiveCount?.data?.count ?? '—'}</p>
              <p className="text-sm text-muted-foreground">Disabled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') commitSearch(searchInput); }}
                onBlur={() => commitSearch(searchInput)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => handleFilterChange(v, statusFilter)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="All roles" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {['superAdmin', 'admin', 'manager', 'employee', 'user', 'guest'].map((r) => (
                  <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => handleFilterChange(roleFilter, v)}>
              <SelectTrigger className="w-36"><SelectValue placeholder="All status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users {total > 0 && `(${total})`}</CardTitle>
          <CardDescription>All registered users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /><span>Loading…</span>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">Error loading users</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                        {user.role === 'superAdmin' && (
                          <span className="ml-2 text-xs text-amber-600 font-semibold">(you)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={ROLE_COLORS[user.role] ?? 'outline'} className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={() => handleToggle(user)}
                          disabled={user.role === 'superAdmin'}
                        />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="outline" size="sm"
                            onClick={() => openEdit(user)}
                            disabled={user.role === 'superAdmin'}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline" size="sm"
                            onClick={() => { setToDelete(user); setDelConfirm(''); }}
                            disabled={user.role === 'superAdmin' || deleting}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {users.length === 0 && (
                <div className="text-center py-10 text-gray-500">No users found.</div>
              )}

              <Pagination offset={offset} limit={PAGE_SIZE} total={total} onOffset={setOffset} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(o) => { if (!o) { setEditingUser(null); setFormData(EMPTY_FORM); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details and role.</DialogDescription>
          </DialogHeader>
          <UserForm data={formData} onChange={setFormData} isEdit />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setEditingUser(null); setFormData(EMPTY_FORM); }}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!toDelete} onOpenChange={(o) => { if (!o) { setToDelete(null); setDelConfirm(''); } }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>This is permanent and cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {toDelete && (
              <p className="text-sm bg-muted/50 rounded-md px-3 py-2">
                {toDelete.first_name} {toDelete.last_name} — <span className="text-muted-foreground">{toDelete.email}</span>
              </p>
            )}
            <p className="text-sm text-gray-600">Type <strong>delete</strong> to confirm:</p>
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
            <Button variant="outline" onClick={() => { setToDelete(null); setDelConfirm(''); }}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={delConfirm.toLowerCase() !== 'delete' || deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
