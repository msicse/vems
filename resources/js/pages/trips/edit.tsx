import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormTextarea } from '@/base-components/base-form';
import { SearchableSelect } from '@/components/searchable-select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem, Trip } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, X, UserPlus, Calendar, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Passenger {
    user_id: string;
    pickup_stop_id?: string;
    dropoff_stop_id?: string;
}

export default function EditTrip({ trip, vehicles, routes, departments, employees }: any) {
    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const [passengers, setPassengers] = useState<Passenger[]>([]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Trips', href: '/trips' },
        { title: trip.trip_number, href: `/trips/${trip.id}` },
        { title: 'Edit', href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        vehicle_route_id: trip.vehicle_route_id?.toString() || '',
        vehicle_id: trip.vehicle_id.toString(),
        department_id: trip.department_id?.toString() || '',
        purpose: trip.purpose || '',
        description: trip.description || '',
        schedule_type: trip.schedule_type || 'pick-and-drop',
        priority: trip.priority || 'medium',
        scheduled_date: trip.scheduled_date || '',
        scheduled_start_time: trip.scheduled_start_time || '',
        scheduled_end_time: trip.scheduled_end_time || '',
        notes: trip.notes || '',
        passengers: [] as Passenger[],
    });

    useEffect(() => {
        // Initialize existing passengers
        if (trip.passengers && trip.passengers.length > 0) {
            const existingPassengers = trip.passengers.map((p: any) => ({
                user_id: p.user_id.toString(),
                pickup_stop_id: p.pickup_stop_id?.toString() || '',
                dropoff_stop_id: p.dropoff_stop_id?.toString() || '',
            }));
            setPassengers(existingPassengers);
            setData('passengers', existingPassengers);
        }

        // Initialize selected route
        if (trip.vehicle_route_id) {
            const route = routes?.find((r: any) => r.value === trip.vehicle_route_id);
            setSelectedRoute(route);
        }
    }, []);

    const selectedVehicle = vehicles?.find((v: any) => v.value === data.vehicle_id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('trips.update', trip.id), {
            onSuccess: () => router.visit(route('trips.show', trip.id)),
        });
    };

    const addPassenger = () => {
        setPassengers([...passengers, { user_id: '' }]);
    };

    const removePassenger = (index: number) => {
        const updated = passengers.filter((_, i) => i !== index);
        setPassengers(updated);
        setData('passengers', updated);
    };

    const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
        const updated = [...passengers];
        updated[index] = { ...updated[index], [field]: value };
        setPassengers(updated);
        setData('passengers', updated);
    };

    const handleRouteChange = (value: string) => {
        setData('vehicle_route_id', value);
        const route = routes?.find((r: any) => r.value === value);
        setSelectedRoute(route);
    };

    // Check if trip can be edited
    const canEdit = ['pending', 'approved'].includes(trip.status);

    if (!canEdit) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title={`Edit Trip ${trip.trip_number}`} />
                <div className="space-y-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            This trip cannot be edited in its current status: {trip.status}
                        </AlertDescription>
                    </Alert>
                    <Button onClick={() => router.visit(route('trips.show', trip.id))}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Trip Details
                    </Button>
                </div>
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Trip ${trip.trip_number}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Edit Trip {trip.trip_number}</h1>
                        <p className="text-sm text-gray-500 mt-1">Update trip details</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit(route('trips.show', trip.id))}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Trip Information</CardTitle>
                            <CardDescription>Basic details about the trip</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vehicle_id">Vehicle *</Label>
                                    <Select
                                        value={data.vehicle_id}
                                        onValueChange={(value) => setData('vehicle_id', value)}
                                    >
                                        <SelectTrigger id="vehicle_id">
                                            <SelectValue placeholder="Select vehicle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehicles?.map((vehicle: any) => (
                                                <SelectItem key={vehicle.value} value={vehicle.value}>
                                                    {vehicle.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedVehicle && (
                                        <p className="text-sm text-gray-500">Driver: {selectedVehicle.driver}</p>
                                    )}
                                    {errors.vehicle_id && <p className="text-sm text-red-500">{errors.vehicle_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vehicle_route_id">Route (Optional)</Label>
                                    <Select
                                        value={data.vehicle_route_id}
                                        onValueChange={handleRouteChange}
                                    >
                                        <SelectTrigger id="vehicle_route_id">
                                            <SelectValue placeholder="Select route" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {routes?.map((route: any) => (
                                                <SelectItem key={route.value} value={route.value}>
                                                    {route.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.vehicle_route_id && <p className="text-sm text-red-500">{errors.vehicle_route_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="schedule_type">Schedule Type *</Label>
                                    <Select
                                        value={data.schedule_type}
                                        onValueChange={(value) => setData('schedule_type', value)}
                                    >
                                        <SelectTrigger id="schedule_type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pick-and-drop">Pick and Drop</SelectItem>
                                            <SelectItem value="engineer">Engineer</SelectItem>
                                            <SelectItem value="training">Training</SelectItem>
                                            <SelectItem value="adhoc">Ad-hoc</SelectItem>
                                            <SelectItem value="reposition">Reposition</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.schedule_type && <p className="text-sm text-red-500">{errors.schedule_type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority *</Label>
                                    <Select
                                        value={data.priority}
                                        onValueChange={(value) => setData('priority', value)}
                                    >
                                        <SelectTrigger id="priority">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.priority && <p className="text-sm text-red-500">{errors.priority}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department_id">Department (Optional)</Label>
                                    <Select
                                        value={data.department_id}
                                        onValueChange={(value) => setData('department_id', value)}
                                    >
                                        <SelectTrigger id="department_id">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments?.map((dept: any) => (
                                                <SelectItem key={dept.value} value={dept.value}>
                                                    {dept.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.department_id && <p className="text-sm text-red-500">{errors.department_id}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="purpose">Purpose *</Label>
                                <Input
                                    id="purpose"
                                    value={data.purpose}
                                    onChange={(e) => setData('purpose', e.target.value)}
                                    placeholder="Enter trip purpose"
                                />
                                {errors.purpose && <p className="text-sm text-red-500">{errors.purpose}</p>}
                            </div>

                            <FormTextarea
                                label="Description"
                                name="description"
                                value={data.description}
                                onChange={(value) => setData('description', value)}
                                placeholder="Enter trip description"
                                rows={3}
                                error={errors.description}
                            />
                        </CardContent>
                    </Card>

                    {/* Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Schedule
                            </CardTitle>
                            <CardDescription>When should this trip take place?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_date">Date *</Label>
                                    <Input
                                        id="scheduled_date"
                                        type="date"
                                        value={data.scheduled_date}
                                        onChange={(e) => setData('scheduled_date', e.target.value)}
                                    />
                                    {errors.scheduled_date && <p className="text-sm text-red-500">{errors.scheduled_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_start_time">Start Time *</Label>
                                    <Input
                                        id="scheduled_start_time"
                                        type="time"
                                        value={data.scheduled_start_time}
                                        onChange={(e) => setData('scheduled_start_time', e.target.value)}
                                    />
                                    {errors.scheduled_start_time && <p className="text-sm text-red-500">{errors.scheduled_start_time}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_end_time">End Time *</Label>
                                    <Input
                                        id="scheduled_end_time"
                                        type="time"
                                        value={data.scheduled_end_time}
                                        onChange={(e) => setData('scheduled_end_time', e.target.value)}
                                    />
                                    {errors.scheduled_end_time && <p className="text-sm text-red-500">{errors.scheduled_end_time}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Passengers */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserPlus className="h-5 w-5" />
                                        Passengers
                                    </CardTitle>
                                    <CardDescription>Manage passengers for this trip</CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addPassenger}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Passenger
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {passengers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No passengers added yet</p>
                                    <p className="text-sm">Click "Add Passenger" to add passengers to this trip</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {passengers.map((passenger, index) => (
                                        <div key={index} className="flex gap-3 items-start p-4 border rounded-lg">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <SearchableSelect
                                                    label="Employee"
                                                    name={`passenger-${index}`}
                                                    value={passenger.user_id}
                                                    onChange={(value) => updatePassenger(index, 'user_id', value)}
                                                    options={employees?.map((emp: any) => ({
                                                        label: `${emp.label}${emp.department ? ` (${emp.department})` : ''}`,
                                                        value: emp.value
                                                    })) || []}
                                                    placeholder="Search employee..."
                                                    required
                                                />

                                                {selectedRoute && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`pickup-${index}`}>Pickup Stop</Label>
                                                            <Select
                                                                value={passenger.pickup_stop_id}
                                                                onValueChange={(value) => updatePassenger(index, 'pickup_stop_id', value)}
                                                            >
                                                                <SelectTrigger id={`pickup-${index}`}>
                                                                    <SelectValue placeholder="Select stop" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {selectedRoute.stops?.map((stop: any) => (
                                                                        <SelectItem key={stop.id} value={stop.id.toString()}>
                                                                            {stop.order}. {stop.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor={`dropoff-${index}`}>Dropoff Stop</Label>
                                                            <Select
                                                                value={passenger.dropoff_stop_id}
                                                                onValueChange={(value) => updatePassenger(index, 'dropoff_stop_id', value)}
                                                            >
                                                                <SelectTrigger id={`dropoff-${index}`}>
                                                                    <SelectValue placeholder="Select stop" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {selectedRoute.stops?.map((stop: any) => (
                                                                        <SelectItem key={stop.id} value={stop.id.toString()}>
                                                                            {stop.order}. {stop.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removePassenger(index)}
                                                className="mt-8"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Additional Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormTextarea
                                label="Notes"
                                name="notes"
                                value={data.notes}
                                onChange={(value) => setData('notes', value)}
                                placeholder="Any additional notes or instructions for this trip"
                                rows={4}
                                error={errors.notes}
                            />
                        </CardContent>
                    </Card>

                    {/* Submit Actions */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(route('trips.show', trip.id))}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Trip'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
