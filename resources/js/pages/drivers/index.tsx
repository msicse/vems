import { ServerSideDataTable } from '@/base-components/base-data-table';
import { PageHeader } from '@/base-components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem, ColumnFilter, DataTableColumn, User } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit, Eye, Phone, Trash2, UserCheck, UserX, MapPin } from 'lucide-react';

interface PaginatedDrivers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface DriversPageProps {
    drivers: PaginatedDrivers;
    filterOptions: {
        statuses: string[];
        blood_groups: string[];
    };
    stats: {
        total: number;
        active: number;
        inactive: number;
        suspended: number;
    };
    queryParams: {
        search?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
        filters?: Record<string, any>;
        per_page?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Drivers', href: '/drivers' },
];

export default function DriversIndex({ drivers, filterOptions, stats, queryParams }: DriversPageProps) {
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
            label: 'Driver',
            sortable: true,
            render: (value, row) => (
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        {row.image ? (
                            <img className="h-10 w-10 rounded-full" src={row.image} alt={row.name} />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-700">
                                    {row.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{value}</div>
                        <div className="text-sm text-gray-500">{row.email}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'phone',
            label: 'Contact',
            sortable: true,
            render: (value, row) => (
                <div className="space-y-1">
                    {value && (
                        <div className="flex items-center space-x-1 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{value}</span>
                        </div>
                    )}
                    {row.whatsapp_id && (
                        <div className="flex items-center space-x-1 text-sm text-green-600">
                            <Phone className="h-3 w-3" />
                            <span>WhatsApp</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'address',
            label: 'Location',
            sortable: true,
            render: (value) => (
                <div className="flex items-center space-x-1 text-sm">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="truncate max-w-32" title={value}>
                        {value || 'No address'}
                    </span>
                </div>
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

                const icons = {
                    active: <UserCheck className="h-3 w-3" />,
                    inactive: <UserX className="h-3 w-3" />,
                    suspended: <UserX className="h-3 w-3" />,
                };

                return (
                    <Badge variant={variants[value as keyof typeof variants]} className="gap-1">
                        {icons[value as keyof typeof icons]}
                        {value}
                    </Badge>
                );
            },
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
                            router.visit(route('drivers.show', row.id));
                        }}
                        title="View driver"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.visit(route('drivers.edit', row.id));
                        }}
                        title="Edit driver"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete driver ${row.name}?`)) {
                                router.delete(route('drivers.destroy', row.id), {
                                    preserveScroll: true,
                                });
                            }
                        }}
                        title="Delete driver"
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
            key: 'status',
            label: 'Status',
            type: 'multiselect',
            options: filterOptions.statuses.map((status) => ({
                label: status.charAt(0).toUpperCase() + status.slice(1),
                value: status,
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

    const handleRowClick = (driver: User) => {
        router.visit(route('drivers.show', driver.id));
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Drivers" />

            <div className="space-y-6">
                <PageHeader
                    title="Drivers"
                    description="Manage your delivery drivers with specialized tools and tracking."
                    actions={[
                        {
                            label: 'Add Driver',
                            href: route('users.create') + '?user_type=driver',
                            variant: 'outline',
                        },
                    ]}
                    stats={[
                        {
                            label: 'Total Drivers',
                            value: stats.total,
                        },
                        {
                            label: 'Active',
                            value: stats.active,
                        },
                        {
                            label: 'Inactive',
                            value: stats.inactive,
                        },
                        {
                            label: 'Suspended',
                            value: stats.suspended,
                        },
                    ]}
                />

                {/* Data Table */}
                <ServerSideDataTable
                    data={drivers}
                    columns={columns}
                    queryParams={queryParams}
                    filterOptions={filterOptions}
                    filters={filters}
                    searchPlaceholder="Search drivers by name, email, phone, or address..."
                    exportable={false}
                    onRowClick={handleRowClick}
                    emptyMessage="No drivers found. Add your first driver to get started."
                />
            </div>
        </AppSidebarLayout>
    );
}
