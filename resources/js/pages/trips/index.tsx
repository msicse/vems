import { ServerSideDataTable } from '@/base-components/base-data-table';
import { PageHeader } from '@/base-components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem, DataTableColumn, Trip } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Calendar, Car, CheckCircle, Clock, Edit, Eye, MapPin, Plus, Trash2, User, XCircle } from 'lucide-react';

interface PaginatedTrips {
    data: Trip[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface TripsPageProps {
    trips: PaginatedTrips;
    stats: {
        total: number;
        pending: number;
        approved: number;
        in_progress: number;
        completed: number;
        today: number;
    };
    queryParams: {
        search?: string;
        status?: string;
        schedule_type?: string;
        date_from?: string;
        date_to?: string;
        vehicle_id?: number;
        sort?: string;
        direction?: 'asc' | 'desc';
        per_page?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Trips', href: '/trips' },
];

const getStatusColor = (status: Trip['status']) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-blue-100 text-blue-800',
        rejected: 'bg-red-100 text-red-800',
        assigned: 'bg-cyan-100 text-cyan-800',
        in_progress: 'bg-purple-100 text-purple-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

const getPriorityColor = (priority: Trip['priority']) => {
    const colors = {
        urgent: 'bg-red-100 text-red-800',
        high: 'bg-orange-100 text-orange-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-gray-100 text-gray-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
};

export default function TripsIndex({ trips, stats, queryParams }: TripsPageProps) {
    const columns: DataTableColumn<Trip>[] = [
        {
            key: 'trip_number',
            label: 'Trip #',
            sortable: true,
            render: (value) => (
                <span className="font-mono font-medium">{value}</span>
            ),
        },
        {
            key: 'scheduled_date',
            label: 'Date & Time',
            sortable: true,
            render: (_, row) => (
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(row.scheduled_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {row.scheduled_start_time} - {row.scheduled_end_time}
                    </div>
                </div>
            ),
        },
        {
            key: 'purpose',
            label: 'Purpose',
            sortable: true,
            render: (value, row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{value}</span>
                    <span className="text-xs text-gray-500 capitalize">{row.schedule_type.replace('-', ' ')}</span>
                </div>
            ),
        },
        {
            key: 'vehicle_id',
            label: 'Vehicle',
            render: (_, row) => (
                row.vehicle ? (
                    <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{row.vehicle.registration_number}</span>
                    </div>
                ) : (
                    <span className="text-sm text-gray-400">Not assigned</span>
                )
            ),
        },
        {
            key: 'requested_by',
            label: 'Requester',
            render: (_, row) => (
                <div className="flex items-center space-x-2">
                    <User className="h-3 w-3 text-gray-400" />
                    <span className="text-sm">{row.requester?.name}</span>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value) => (
                <Badge className={getStatusColor(value as Trip['status'])}>
                    {value}
                </Badge>
            ),
        },
        {
            key: 'priority',
            label: 'Priority',
            render: (value) => (
                <Badge className={getPriorityColor(value as Trip['priority'])}>
                    {value}
                </Badge>
            ),
        },
        {
            key: 'actions' as keyof Trip,
            label: 'Actions',
            render: (_, row) => (
                <div className="flex items-center space-x-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.visit(route('trips.show', row.id));
                        }}
                        title="View trip"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    {['pending', 'approved'].includes(row.status) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.visit(route('trips.edit', row.id));
                            }}
                            title="Edit trip"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                    {row.status === 'pending' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete trip "${row.trip_number}"?`)) {
                                    router.delete(route('trips.destroy', row.id));
                                }
                            }}
                            title="Delete trip"
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const handleRowClick = (trip: Trip) => {
        router.visit(route('trips.show', trip.id));
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Trips" />

            <div className="space-y-6">
                <PageHeader
                    title="Trips Management"
                    description="Manage vehicle trips, schedules, and assignments."
                    actions={[
                        {
                            label: 'Create Trip',
                            icon: <Plus className="mr-2 h-4 w-4" />,
                            href: route('trips.create'),
                        },
                    ]}
                    stats={[
                        {
                            label: 'Total Trips',
                            value: stats.total,
                        },
                        {
                            label: 'Pending Approval',
                            value: stats.pending,
                        },
                        {
                            label: 'In Progress',
                            value: stats.in_progress,
                        },
                        {
                            label: 'Today',
                            value: stats.today,
                        },
                    ]}
                />

                <ServerSideDataTable
                    data={trips}
                    columns={columns}
                    queryParams={queryParams}
                    filterOptions={{}}
                    filters={[]}
                    searchPlaceholder="Search trips..."
                    exportable={false}
                    onRowClick={handleRowClick}
                    emptyMessage="No trips found. Create your first trip to get started."
                />
            </div>
        </AppSidebarLayout>
    );
}
