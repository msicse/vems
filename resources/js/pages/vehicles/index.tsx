import { ServerSideDataTable } from '@/base-components/base-data-table';
import { PageHeader } from '@/base-components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem, ColumnFilter, DataTableColumn, Vehicle } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';

interface PaginatedVehicles {
    data: Vehicle[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface VehiclesPageProps {
    vehicles: PaginatedVehicles;
    filterOptions: {
        brands: string[];
        colors: string[];
        statuses: Array<{ label: string; value: boolean }>;
    };
    stats: {
        total: number;
        active: number;
        brands: number;
        inactive: number;
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
    { title: 'Vehicles', href: '/vehicles' },
];

export default function VehiclesIndex({ vehicles, filterOptions, stats, queryParams }: VehiclesPageProps) {
    // Debug logging
    console.log('VehiclesIndex - queryParams:', queryParams);
    console.log('VehiclesIndex - vehicles data:', vehicles);

    const handleRowClick = (vehicle: Vehicle) => {
        router.visit(route('vehicles.show', vehicle.id));
    };

    // Test manual sorting
    const handleSort = (field: string) => {
        const currentDirection = queryParams?.direction || 'asc';
        const newDirection = queryParams?.sort === field && currentDirection === 'asc' ? 'desc' : 'asc';

        console.log('Manual sort clicked:', { field, newDirection });

        router.get(route('vehicles.index'), {
            ...queryParams,
            sort: field,
            direction: newDirection,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };
    const columns: DataTableColumn<Vehicle>[] = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            className: 'w-16',
        },
        {
            key: 'brand',
            label: 'Brand',
            sortable: true,
            filterable: true,
            render: (value) => (
                <span className="font-medium">{value}</span>
            ),
        },
        {
            key: 'model',
            label: 'Model',
            sortable: true,
            render: (value) => (
                <span className="text-muted-foreground">{value}</span>
            ),
        },
        {
            key: 'color',
            label: 'Color',
            sortable: true,
            filterable: true,
            render: (value) => (
                <Badge variant="outline" className="capitalize">
                    {value}
                </Badge>
            ),
        },
        {
            key: 'registration_number',
            label: 'Registration',
            sortable: true,
            render: (value) => (
                <span className="font-mono text-sm">{value}</span>
            ),
        },
        {
            key: 'vendor',
            label: 'Vendor',
            sortable: true,
            render: (value, vehicle) => {
                // Handle both the vendor object and the legacy vendor string
                const vendorName = typeof value === 'object' && value?.name
                    ? value.name
                    : vehicle.vendor?.name || (typeof value === 'string' ? value : null);

                return (
                    <span className="text-muted-foreground">
                        {vendorName || 'N/A'}
                    </span>
                );
            },
        },
        {
            key: 'driver',
            label: 'Driver',
            sortable: true,
            render: (value, vehicle) => {
                const driver = vehicle.driver;

                if (!driver) {
                    return (
                        <span className="text-muted-foreground">N/A</span>
                    );
                }

                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{driver.name}</span>
                        <span className="text-xs text-muted-foreground">
                            {driver.official_phone || driver.email}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'is_active',
            label: 'Status',
            sortable: true,
            filterable: true,
            render: (value) => (
                <Badge variant={value ? 'default' : 'secondary'}>
                    {value ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'created_at',
            label: 'Created',
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
            key: 'actions' as keyof Vehicle,
            label: 'Actions',
            render: (_, row) => (
                <div className="flex items-center space-x-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.visit(route('vehicles.show', row.id));
                        }}
                        title="View vehicle"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.visit(route('vehicles.edit', row.id));
                        }}
                        title="Edit vehicle"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete ${row.brand} ${row.model}?`)) {
                                router.delete(route('vehicles.destroy', row.id), {
                                    preserveScroll: true,
                                });
                            }
                        }}
                        title="Delete vehicle"
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
            key: 'brand',
            label: 'Brand',
            type: 'multiselect',
            options: filterOptions.brands.map((brand) => ({
                label: brand,
                value: brand,
            })),
        },
        {
            key: 'color',
            label: 'Color',
            type: 'multiselect',
            options: filterOptions.colors.map((color) => ({
                label: color.charAt(0).toUpperCase() + color.slice(1),
                value: color,
            })),
        },
        {
            key: 'is_active',
            label: 'Status',
            type: 'multiselect',
            options: filterOptions.statuses.map((status) => ({
                label: status.label,
                value: status.value,
            })),
        },
    ];

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicles" />

            <div className="space-y-6">
                <PageHeader
                    title="Vehicles"
                    description="Manage fleet and documentation"
                    actions={[
                        {
                            label: 'Sort by Name',
                            variant: 'outline',
                            onClick: () => handleSort('brand')
                        },
                        {
                            label: 'Sort by ID',
                            variant: 'outline',
                            onClick: () => handleSort('id')
                        },
                        {
                            label: 'Add Vehicle',
                            icon: <Plus className="mr-2 h-4 w-4" />,
                            href: route('vehicles.create'),
                        },
                    ]}
                    stats={[
                        {
                            label: 'Total Vehicles',
                            value: stats.total,
                        },
                        {
                            label: 'Active Vehicles',
                            value: stats.active,
                        },
                        {
                            label: 'Brands',
                            value: stats.brands,
                        },
                        {
                            label: 'Inactive',
                            value: stats.inactive,
                        },
                    ]}
                />

                {/* Data Table */}
                <ServerSideDataTable
                    data={vehicles}
                    columns={columns}
                    queryParams={queryParams}
                    filterOptions={filterOptions}
                    filters={filters}
                    searchPlaceholder="Search vehicles..."
                    exportable={false}
                    onRowClick={handleRowClick}
                    emptyMessage="No vehicles found. Add your first vehicle to get started."
                />

                {/* Debug Info */}
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h3 className="font-bold">Debug Info:</h3>
                    <p>Current Sort: {queryParams?.sort || 'none'}</p>
                    <p>Direction: {queryParams?.direction || 'none'}</p>
                    <p>Total Records: {vehicles?.total || 0}</p>
                    <p>Current Page: {vehicles?.current_page || 1}</p>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
