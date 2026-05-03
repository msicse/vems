import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem, Trip } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    Car,
    CheckCircle,
    Clock,
    Edit,
    FileText,
    Flag,
    MapPin,
    MessageSquare,
    User,
    Users,
    XCircle,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Trips', href: '/trips' },
    { title: 'Trip Details', href: '#' },
];

const getStatusBadge = (status: Trip['status']) => {
    const config = {
        pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
        approved: { label: 'Approved', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
        rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
        assigned: { label: 'Assigned', className: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: CheckCircle },
        in_progress: { label: 'In Progress', className: 'bg-purple-100 text-purple-800 border-purple-200', icon: Clock },
        completed: { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
        cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
    };
    const { label, className, icon: Icon } = config[status] || config.pending;
    return (
        <Badge className={`${className} flex items-center gap-1.5`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
        </Badge>
    );
};

const getPriorityBadge = (priority: Trip['priority']) => {
    const config = {
        urgent: { label: 'Urgent', className: 'bg-red-100 text-red-800 border-red-300', icon: Flag },
        high: { label: 'High', className: 'bg-orange-100 text-orange-800 border-orange-200', icon: Flag },
        medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Flag },
        low: { label: 'Low', className: 'bg-gray-100 text-gray-800 border-gray-200', icon: Flag },
    };
    const { label, className, icon: Icon } = config[priority] || config.medium;
    return (
        <Badge variant="outline" className={`${className} flex items-center gap-1.5`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
        </Badge>
    );
};

export default function ShowTrip({ trip }: { trip: Trip }) {
    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Trip ${trip.trip_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold">{trip.trip_number}</h1>
                            {getStatusBadge(trip.status)}
                            {getPriorityBadge(trip.priority)}
                        </div>
                        {trip.team_number && (
                            <p className="text-sm text-gray-600">Team: {trip.team_number}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {['pending', 'approved'].includes(trip.status) && (
                            <Button
                                variant="default"
                                onClick={() => router.visit(route('trips.edit', trip.id))}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Trip
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('trips.index'))}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Trip Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Trip Information
                                </CardTitle>
                                <CardDescription>Basic trip details and schedule</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Trip Type</label>
                                        <p className="mt-1 text-sm">
                                            {trip.trip_type ? (
                                                <Badge variant="outline" className="capitalize">
                                                    {trip.trip_type.replace('-', ' ')}
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-400">Not specified</span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Schedule Type</label>
                                        <p className="mt-1 text-sm capitalize">
                                            {trip.schedule_type.replace('-', ' ')}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Scheduled Date
                                        </label>
                                        <p className="mt-1 text-sm font-medium">
                                            {new Date(trip.scheduled_date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            Time
                                        </label>
                                        <p className="mt-1 text-sm font-medium">
                                            {trip.scheduled_start_time} - {trip.scheduled_end_time}
                                        </p>
                                    </div>

                                    {(trip.start_location || trip.end_location) && (
                                        <>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    Start Location
                                                </label>
                                                <p className="mt-1 text-sm">{trip.start_location || '-'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    End Location
                                                </label>
                                                <p className="mt-1 text-sm">{trip.end_location || '-'}</p>
                                            </div>
                                        </>
                                    )}

                                    {trip.department && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Department</label>
                                            <p className="mt-1 text-sm">{trip.department.name}</p>
                                        </div>
                                    )}

                                    {trip.team_number && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Team Number</label>
                                            <p className="mt-1 text-sm font-medium">{trip.team_number}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Return Trip</label>
                                        <p className="mt-1 text-sm">
                                            {trip.is_return ? (
                                                <Badge variant="outline" className="bg-blue-50">Yes</Badge>
                                            ) : (
                                                <span className="text-gray-500">No</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {trip.description && (
                                    <>
                                        <Separator />
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Description</label>
                                            <p className="mt-1 text-sm text-gray-700">{trip.description}</p>
                                        </div>
                                    </>
                                )}

                                {trip.remarks && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Remarks</label>
                                        <p className="mt-1 text-sm text-gray-700">{trip.remarks}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Vehicle & Driver */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Car className="h-5 w-5" />
                                    Vehicle & Driver
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {trip.vehicle ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                                <Car className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-600">Vehicle</p>
                                                <p className="text-lg font-semibold">{trip.vehicle.registration_number}</p>
                                                <p className="text-sm text-gray-500">
                                                    {trip.vehicle.brand} {trip.vehicle.model}
                                                </p>
                                            </div>
                                        </div>

                                        {trip.driver && (
                                            <>
                                                <Separator />
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                                        <User className="h-6 w-6 text-green-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-600">Driver</p>
                                                        <p className="text-lg font-semibold">{trip.driver.name}</p>
                                                        {trip.driver.official_phone && (
                                                            <p className="text-sm text-gray-500">{trip.driver.official_phone}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Car className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No vehicle assigned yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Passengers */}
                        {trip.passengers && trip.passengers.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Passengers ({trip.passengers.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {trip.passengers.map((passenger, index) => (
                                            <div key={passenger.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{passenger.user?.name}</p>
                                                    {passenger.user?.employee_id && (
                                                        <p className="text-xs text-gray-500">{passenger.user.employee_id}</p>
                                                    )}
                                                </div>
                                                {passenger.boarding_status && (
                                                    <Badge variant="outline" className="capitalize">
                                                        {passenger.boarding_status.replace('_', ' ')}
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Factories */}
                        {trip.factories && trip.factories.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Factories ({trip.factories.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {trip.factories.map((factory: any) => (
                                            <Badge key={factory.id} variant="outline" className="flex items-center gap-1.5">
                                                <Building2 className="h-3 w-3" />
                                                {factory.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Department Headcount */}
                        {trip.departments && trip.departments.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Headcount by Department
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {trip.departments.map((dept: any) => (
                                            <div key={dept.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/30">
                                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-sm font-medium">{dept.name}</span>
                                                <span className="text-sm text-muted-foreground">× {dept.pivot?.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Logistics */}
                        {trip.logistics && trip.logistics.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Logistics ({trip.logistics.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {trip.logistics.map((log: any) => (
                                            <Badge key={log.id} variant="secondary">
                                                {log.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Comments & Notes */}
                        {(trip.comments || trip.notes) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5" />
                                        Comments & Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {trip.comments && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Comments</label>
                                            <p className="mt-1 text-sm text-gray-700">{trip.comments}</p>
                                        </div>
                                    )}
                                    {trip.notes && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Additional Notes</label>
                                            <p className="mt-1 text-sm text-gray-700">{trip.notes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Request Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Request Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Requested By</label>
                                    <p className="mt-1 text-sm font-medium">{trip.requester?.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(trip.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                {trip.approved_by && trip.approver && (
                                    <>
                                        <Separator />
                                        <div>
                                            <label className="text-xs font-medium text-gray-600">Approved By</label>
                                            <p className="mt-1 text-sm font-medium">{trip.approver.name}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        {trip.status === 'pending' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button
                                        onClick={() => router.post(route('trips.approve', trip.id))}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve Trip
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            const reason = prompt('Rejection reason:');
                                            if (reason) {
                                                router.post(route('trips.reject', trip.id), { rejection_reason: reason });
                                            }
                                        }}
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject Trip
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
