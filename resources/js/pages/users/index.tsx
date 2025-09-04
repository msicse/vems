import { ServerSideDataTable } from '@/base-components/base-data-table';
import { PageHeader } from '@/base-components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem, ColumnFilter, DataTableColumn } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2, Shield, User, Mail } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    user_type: string;
    department: { name: string } | null;
    status: string;
    roles: Array<{ name: string }>;
    is_driver: boolean;
    driver_status: string | null;
    blood_group: string | null;
    phone: string | null;
    created_at: string;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface UsersPageProps {
    users: PaginatedUsers;
    filterOptions: {
        user_types: string[];
        statuses: string[];
        roles: string[];
        departments: Array<{ id: number; name: string }>;
        blood_groups: string[];
    };
    stats: {
        total: number;
        active: number;
        drivers: number;
        inactive: number;
    };
    queryParams: {
        search?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
        filters?: Record<string, string | string[]>;
        per_page?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: '/users' },
];

export default function UsersIndex({
    users,
    filterOptions,
    stats,
    queryParams
}: UsersPageProps) {
    const handleRowClick = (user: User) => {
        router.visit(route('users.show', user.id));
    };

    // Define table columns
    const columns: DataTableColumn<User>[] = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            className: 'w-16',
        },
        {
            key: 'name',
            label: 'User',
            sortable: true,
            render: (value, user) => (
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-gray-900">
                            {value}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="h-3 w-3" />
                            {user.email}
                        </div>
                        <div className="text-xs text-gray-400">
                            @{user.username}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'user_type',
            label: 'Type',
            sortable: true,
            filterable: true,
            render: (value) => {
                const variants = {
                    admin: 'destructive',
                    transport_manager: 'default',
                    driver: 'secondary',
                    employee: 'outline',
                } as const;

                const icons = {
                    admin: <Shield className="h-3 w-3" />,
                    transport_manager: <Shield className="h-3 w-3" />,
                    driver: <User className="h-3 w-3" />,
                    employee: <User className="h-3 w-3" />,
                };

                return (
                    <Badge variant={variants[value as keyof typeof variants]} className="gap-1">
                        {icons[value as keyof typeof icons]}
                        {value?.replace('_', ' ')}
                    </Badge>
                );
            },
        },
        {
            key: 'department',
            label: 'Department',
            sortable: true,
            filterable: true,
            render: (value) => (
                <span className="text-sm">
                    {value?.name || 'No Department'}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            filterable: true,
            render: (value) => {
                const variants = {
                    active: 'default',
                    inactive: 'secondary',
                    suspended: 'destructive',
                } as const;

                return (
                    <Badge variant={variants[value as keyof typeof variants]}>
                        {value}
                    </Badge>
                );
            },
        },
        {
            key: 'roles',
            label: 'Roles',
            sortable: false,
            filterable: true,
            render: (value) => (
                <div className="flex flex-wrap gap-1">
                    {value?.map((role: { name: string }) => (
                        <Badge key={role.name} variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            {role.name}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            key: 'blood_group',
            label: 'Blood Group',
            sortable: true,
            filterable: true,
            render: (value) => (
                <span className="font-mono text-sm bg-red-50 text-red-700 px-2 py-1 rounded">
                    {value || 'N/A'}
                </span>
            ),
        },
        {
            key: 'created_at',
            label: 'Joined',
            sortable: true,
            render: (value) =>
                new Date(value).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }),
            className: 'text-muted-foreground',
        },
        {
            key: 'actions' as keyof User,
            label: 'Actions',
            render: (_, row) => (
                <div className="flex items-center space-x-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.visit(route('users.show', row.id));
                        }}
                        title="View user"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.visit(route('users.edit', row.id));
                        }}
                        title="Edit user"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete ${row.name}?`)) {
                                router.delete(route('users.destroy', row.id), {
                                    preserveScroll: true,
                                });
                            }
                        }}
                        title="Delete user"
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    // Define filters
    const filters: ColumnFilter[] = [
        {
            key: 'user_type',
            label: 'User Type',
            type: 'multiselect',
            options: filterOptions.user_types.map((type) => ({
                label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
                value: type,
            })),
        },
        {
            key: 'status',
            label: 'Status',
            type: 'multiselect',
            options: filterOptions.statuses.map((status) => ({
                label: status.charAt(0).toUpperCase() + status.slice(1),
                value: status,
            })),
        },
        {
            key: 'department_id',
            label: 'Department',
            type: 'multiselect',
            options: filterOptions.departments.map((dept) => ({
                label: dept.name,
                value: dept.id.toString(),
            })),
        },
        {
            key: 'roles',
            label: 'Roles',
            type: 'multiselect',
            options: filterOptions.roles.map((role) => ({
                label: role.charAt(0).toUpperCase() + role.slice(1),
                value: role,
            })),
        },
        {
            key: 'blood_group',
            label: 'Blood Group',
            type: 'multiselect',
            options: filterOptions.blood_groups.map((group) => ({
                label: group,
                value: group,
            })),
        },
    ];

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="space-y-6">
                <PageHeader
                    title="Users"
                    description="Manage users and permissions"
                    actions={[
                        {
                            label: 'Export Users',
                            variant: 'outline',
                            href: route('users.export'),
                        },
                        {
                            label: 'Add User',
                            icon: <Plus className="mr-2 h-4 w-4" />,
                            href: route('users.create'),
                        },
                    ]}
                    stats={[
                        {
                            label: 'Total Users',
                            value: stats.total,
                        },
                        {
                            label: 'Active Users',
                            value: stats.active,
                        },
                        {
                            label: 'Drivers',
                            value: stats.drivers,
                        },
                        {
                            label: 'Inactive',
                            value: stats.inactive,
                        },
                    ]}
                />

                {/* Data Table */}
                <ServerSideDataTable
                    data={users}
                    columns={columns}
                    queryParams={queryParams}
                    filterOptions={filterOptions}
                    filters={filters}
                    searchPlaceholder="Search users by name, email, username, or department..."
                    exportable={true}
                    onRowClick={handleRowClick}
                    emptyMessage="No users found. Add your first user to get started."
                />
            </div>
        </AppSidebarLayout>
    );
}
