import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem, Trip } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Car, CheckCircle, Clock, MapPin, User, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Trips', href: '/trips' },
    { title: 'Trip Details', href: '#' },
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

export default function ShowTrip({ trip }: { trip: Trip }) {
    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Trip ${trip.trip_number}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Trip {trip.trip_number}</h1>
                        <p className="text-sm text-gray-500 mt-1">{trip.purpose}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(trip.status)}>
                            {trip.status}
                        </Badge>
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('trips.index'))}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Trip Details */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Trip Details</h3>
                        <dl className="space-y-3">
                            <div className="flex items-start">
                                <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                <div>
                                    <dt className="text-sm text-gray-500">Scheduled Date</dt>
                                    <dd className="text-sm font-medium">{new Date(trip.scheduled_date).toLocaleDateString()}</dd>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                <div>
                                    <dt className="text-sm text-gray-500">Time</dt>
                                    <dd className="text-sm font-medium">{trip.scheduled_start_time} - {trip.scheduled_end_time}</dd>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <User className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                <div>
                                    <dt className="text-sm text-gray-500">Requested By</dt>
                                    <dd className="text-sm font-medium">{trip.requester?.name}</dd>
                                </div>
                            </div>
                            {trip.vehicle && (
                                <div className="flex items-start">
                                    <Car className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                    <div>
                                        <dt className="text-sm text-gray-500">Vehicle</dt>
                                        <dd className="text-sm font-medium">
                                            {trip.vehicle.registration_number}
                                            {trip.vehicle.driver && (
                                                <span className="text-xs text-gray-500 ml-2">
                                                    (Driver: {trip.vehicle.driver.name})
                                                </span>
                                            )}
                                        </dd>
                                    </div>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Passengers */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Users className="h-5 w-5 mr-2" />
                            Passengers ({trip.passengers?.length || 0})
                        </h3>
                        {trip.passengers && trip.passengers.length > 0 ? (
                            <ul className="space-y-2">
                                {trip.passengers.map((passenger) => (
                                    <li key={passenger.id} className="flex items-center justify-between text-sm">
                                        <span>{passenger.user?.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {passenger.status}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No passengers added</p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                {trip.status === 'pending' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Actions</h3>
                        <div className="flex space-x-3">
                            <Button
                                onClick={() => router.post(route('trips.approve', trip.id))}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve Trip
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const reason = prompt('Rejection reason:');
                                    if (reason) {
                                        router.post(route('trips.reject', trip.id), { rejection_reason: reason });
                                    }
                                }}
                            >
                                Reject Trip
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}
