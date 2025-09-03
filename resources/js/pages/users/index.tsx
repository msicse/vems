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
    roles: Array<{ name: string }>;
    is_driver: boolean;
    driver_status: string | null;
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
    filterOptions?: {
        roles?: string[];
        statuses?: Array<{ label: string; value: string }>;
    };
    stats?: {
        total: number;
        active: number;
        drivers: number;
        inactive: number;
    };
    queryParams?: {
        search?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
        filters?: Record<string, string | number>;
        per_page?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: '/users' },
];

export default function UsersIndex({
    users,
    filterOptions = {},
    stats = { total: 0, active: 0, drivers: 0, inactive: 0 },
    queryParams = {}
}: UsersPageProps) {
    // Debug logging
    console.log('UsersIndex - queryParams:', queryParams);
    console.log('UsersIndex - users data:', users);

    // Test manual sorting
    const handleSort = (field: string) => {
        const currentDirection = queryParams?.direction || 'asc';
        const newDirection = queryParams?.sort === field && currentDirection === 'asc' ? 'desc' : 'asc';

        console.log('Manual sort clicked:', { field, newDirection });

        router.get(route('users.index'), {
            ...queryParams,
            sort: field,
            direction: newDirection,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

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
                    </div>
                </div>
            ),
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true,
            className: 'hidden md:table-cell',
        },
        {
            key: 'roles',
            label: 'Roles',
            sortable: false,
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
            key: 'is_driver',
            label: 'Driver',
            sortable: true,
            render: (value, user) => {
                if (!value) {
                    return <Badge variant="secondary" className="text-xs">No</Badge>;
                }

                return (
                    <Badge
                        variant={user.driver_status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                    >
                        Yes
                    </Badge>
                );
            },
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

    // Define filters - simplified for better compatibility
    const filters: ColumnFilter[] = [];

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="space-y-6">
                <PageHeader
                    title="Users"
                    description="Manage users and permissions"
                    actions={[
                        {
                            label: 'Sort by Name',
                            variant: 'outline',
                            onClick: () => handleSort('name')
                        },
                        {
                            label: 'Sort by ID',
                            variant: 'outline',
                            onClick: () => handleSort('id')
                        },
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
                            value: stats?.total || users?.total || 0,
                        },
                        {
                            label: 'Active Users',
                            value: stats?.active || users?.total || 0,
                        },
                        {
                            label: 'Drivers',
                            value: stats?.drivers || 0,
                        },
                        {
                            label: 'Inactive',
                            value: stats?.inactive || 0,
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
                    searchPlaceholder="Search users..."
                    exportable={true}
                    onRowClick={handleRowClick}
                    emptyMessage="No users found. Add your first user to get started."
                />

                {/* Debug Info */}
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h3 className="font-bold">Debug Info:</h3>
                    <p>Current Sort: {queryParams?.sort || 'none'}</p>
                    <p>Direction: {queryParams?.direction || 'none'}</p>
                    <p>Total Records: {users?.total || 0}</p>
                    <p>Current Page: {users?.current_page || 1}</p>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
