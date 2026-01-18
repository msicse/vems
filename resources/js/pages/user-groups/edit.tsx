import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  UserPlus,
  X,
  Search,
  Building2,
} from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { PageHeader } from '@/base-components/page-header';
import type { BreadcrumbItem } from '@/types';

interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
  employee_id: string;
  department?: string;
  phone?: string;
}

interface UserGroup {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  member_ids: number[];
}

interface EditUserGroupProps {
  group: UserGroup;
  users: User[];
}


const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'User Groups', href: '/user-groups' },
  { title: 'Edit', href: '#' },
];

export default function EditUserGroup({ group, users }: EditUserGroupProps) {
  const { data, setData, put, processing, errors } = useForm({
    name: group.name,
    description: group.description || '',
    status: group.status,
    user_ids: group.member_ids || [] as number[],
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Get unique departments
  const departments = Array.from(new Set(users.map(u => u.department).filter(Boolean))) as string[];

  // Check if filters are active
  const hasActiveFilters = searchTerm !== '' || filterDepartment !== 'all';

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterDepartment('all');
  };

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    put(route('user-groups.update', group.id));
  };

  // Get selected users details
  const selectedUsers = users.filter(user => data.user_ids.includes(user.id));

  // Get available users (not selected)
  const availableUsers = users.filter(user => !data.user_ids.includes(user.id));

  // Filter available users based on search and department
  const filteredUsers = availableUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Add user to selection
  const addUser = (userId: number) => {
    if (!data.user_ids.includes(userId)) {
      setData('user_ids', [...data.user_ids, userId]);
    }
  };

  // Remove user from selection
  const removeUser = (userId: number) => {
    setData('user_ids', data.user_ids.filter(id => id !== userId));
  };


  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Group - ${group.name}`} />

      <div className="space-y-4">
        <PageHeader
          title={`Edit Group - ${group.name}`}
          description=""
          actions={[
            {
              label: 'Back',
              icon: <ArrowLeft className="h-4 w-4" />,
              onClick: () => window.history.back(),
              variant: 'outline',
            },
          ]}
        />

        <form onSubmit={submit}>
          <Card>
            <div className="grid grid-cols-1 lg:grid-cols-5">
              {/* Left Column - Group Details */}
              <div className="lg:col-span-2 p-4 border-r">
                <div className="space-y-2.5">
                  <div>
                    <h3 className="text-base font-semibold">Group Information</h3>
                  </div>

                  {/* Name Field */}
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs font-medium">
                      Group Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="e.g., Sales Team"
                      className={`h-9 text-sm ${errors.name ? 'border-destructive' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name}</p>
                    )}
                  </div>

                  {/* Description Field */}
                  <div className="space-y-1">
                    <Label htmlFor="description" className="text-xs font-medium">Description</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Brief description (optional)"
                      rows={3}
                      className={`text-sm ${errors.description ? 'border-destructive' : ''}`}
                    />
                    {errors.description && (
                      <p className="text-xs text-destructive">{errors.description}</p>
                    )}
                  </div>

                  {/* Status Field */}
                  <div className="space-y-1">
                    <Label htmlFor="status" className="text-xs font-medium">
                      Status <span className="text-destructive">*</span>
                    </Label>
                    <Select value={data.status} onValueChange={(value) => setData('status', value as 'active' | 'inactive')}>
                      <SelectTrigger className={`h-9 text-sm ${errors.status ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active" className="text-sm">Active</SelectItem>
                        <SelectItem value="inactive" className="text-sm">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-xs text-destructive">{errors.status}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={processing}
                      className="w-full h-9"
                      size="sm"
                    >
                      {processing ? 'Updating...' : 'Update Group'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column - Selected Users */}
              <div className="lg:col-span-3 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-base font-semibold">Selected Users</h3>
                    <p className="text-[10px] text-muted-foreground">
                      {selectedUsers.length} selected
                    </p>
                  </div>
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                        Add Users
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
                      {/* Header */}
                      <div className="px-3 py-2 border-b bg-muted/30">
                        <div className="flex items-center justify-between gap-2 pr-8">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold">Add Users</h3>
                            <p className="text-[10px] text-muted-foreground">Search and select</p>
                          </div>
                          {hasActiveFilters && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px] flex-shrink-0"
                              onClick={clearFilters}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>

                        {/* Filters Section */}
                        <div className="px-3 py-2 border-b space-y-1.5">
                          {/* Search and Filter - Combined Row */}
                          <div className="flex gap-1.5">
                            <div className="relative flex-1">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                              <Input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-7 h-7 text-xs"
                              />
                            </div>
                            <div className="w-32">
                              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue placeholder="Dept" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all" className="text-xs">All ({availableUsers.length})</SelectItem>
                                  {departments.map((dept) => {
                                    const count = availableUsers.filter(u => u.department === dept).length;
                                    return (
                                      <SelectItem key={dept} value={dept} className="text-xs">
                                        {dept} ({count})
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Results Header - Simplified */}
                        <div className="px-3 py-1 bg-muted/20 border-b">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">
                              {filteredUsers.length} available
                            </span>
                          </div>
                        </div>

                        {/* Users List */}
                        <div className="flex-1 overflow-y-auto px-3 py-2">
                          {filteredUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                              <UserPlus className="h-8 w-8 text-muted-foreground/40 mb-1" />
                              <p className="text-xs font-medium">{hasActiveFilters ? 'No match' : 'No users'}</p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {filteredUsers.map((user) => (
                                <div
                                  key={user.id}
                                  className="group flex items-center gap-1.5 p-1.5 rounded border hover:border-primary/30 hover:bg-accent cursor-pointer transition-all"
                                  onClick={() => addUser(user.id)}
                                >
                                  {/* User Avatar */}
                                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-[10px] font-semibold text-primary">
                                      {user.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>

                                  {/* User Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                      <p className="text-xs font-medium truncate">{user.name}</p>
                                      <Badge variant="outline" className="text-[8px] px-1">
                                        {user.user_type}
                                      </Badge>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground truncate leading-tight">
                                      {user.email}
                                    </p>
                                  </div>

                                  {/* Add Icon */}
                                  <UserPlus className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        {selectedUsers.length > 0 && (
                          <div className="px-3 py-1.5 border-t bg-muted/30">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground">
                                {selectedUsers.length} selected
                              </span>
                              <Button
                                type="button"
                                size="sm"
                                className="h-6 text-xs px-3"
                                onClick={() => setIsSheetOpen(false)}
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        )}
                      </SheetContent>
                  </Sheet>
                </div>

                {errors.user_ids && (
                  <div className="mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-[10px] text-destructive">{errors.user_ids}</p>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                  {selectedUsers.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <UserPlus className="mx-auto h-8 w-8 mb-1.5 opacity-40" />
                      <p className="text-xs font-medium">No users selected</p>
                      <p className="text-[10px] mt-0.5">Click "Add Users" to get started</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="relative flex items-start gap-2 p-2 border rounded-md hover:bg-accent transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-0.5">
                              <p className="text-xs font-medium truncate">{user.name}</p>
                                <Badge variant="outline" className="text-[8px] px-1">{user.user_type}</Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {user.email}
                            </p>
                            {user.department && (
                              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                <Building2 className="inline h-2 w-2 mr-0.5" />
                                {user.department}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeUser(user.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </AppSidebarLayout>
  );
}
