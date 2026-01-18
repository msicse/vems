import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormTextarea } from '@/base-components/base-form';
import { MultiSelect, MultiSelectBadges } from '@/base-components/base-multi-select';
import { SearchableSelect } from '@/components/searchable-select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, X, UserPlus, Calendar, Clock, MapPin, Search, User } from 'lucide-react';
import { useState } from 'react';
import * as React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Trips', href: '/trips' },
    { title: 'Create Trip', href: '/trips/create' },
];

interface Passenger {
    user_id: string;
    pickup_stop_id?: string;
    dropoff_stop_id?: string;
}

export default function CreateTrip({ vehicles, routes, departments, employees }: any) {
    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const [selectedPassengerIds, setSelectedPassengerIds] = useState<(string | number)[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        vehicle_route_id: '',
        vehicle_id: '',
        department_id: '',
        purpose: '',
        description: '',
        schedule_type: 'pick-and-drop',
        priority: 'medium',
        scheduled_date: '',
        scheduled_start_time: '',
        scheduled_end_time: '',
        notes: '',
        passengers: [] as Passenger[],
    });

    const selectedVehicle = vehicles?.find((v: any) => v.value === data.vehicle_id);

    // Sync passengers with form data
    React.useEffect(() => {
        const passengerData = selectedPassengerIds.map(id => ({
            user_id: id.toString(),
            pickup_stop_id: undefined,
            dropoff_stop_id: undefined,
        }));
        setData('passengers', passengerData);
    }, [selectedPassengerIds]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('trips.store'), {
            onSuccess: () => router.visit(route('trips.index')),
        });
    };

    const updatePassenger = (userId: string, field: keyof Passenger, value: string) => {
        const updated = data.passengers.map(p =>
            p.user_id === userId ? { ...p, [field]: value } : p
        );
        setData('passengers', updated);
    };

    const handleRouteChange = (value: string) => {
        setData('vehicle_route_id', value);
        const route = routes?.find((r: any) => r.value === value);
        setSelectedRoute(route);
    };

    const getEmployeeName = (userId: string | number) => {
        const employee = employees?.find((emp: any) => emp.value.toString() === userId.toString());
        return employee ? employee.label : 'Unknown';
    };

    const getEmployeeDetails = (userId: string | number) => {
        const employee = employees?.find((emp: any) => emp.value.toString() === userId.toString());
        return employee ? {
            name: employee.label,
            employeeId: employee.employee_id,
            department: employee.department
        } : { name: 'Unknown', employeeId: '', department: '' };
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Trip" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Create New Trip</h1>
                        <p className="text-sm text-gray-500 mt-1">Fill in the details below to create a new trip</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit(route('trips.index'))}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Trips
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Trip Information</CardTitle>
                            <CardDescription>Configure the basic details for this trip</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Vehicle & Route */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <SearchableSelect
                                        label="Vehicle"
                                        name="vehicle_id"
                                        value={data.vehicle_id}
                                        onChange={(value) => setData('vehicle_id', value)}
                                        options={vehicles?.map((v: any) => ({
                                            label: v.label,
                                            value: v.value
                                        })) || []}
                                        placeholder="Search vehicle..."
                                        required
                                        error={errors.vehicle_id}
                                    />
                                    {selectedVehicle && (
                                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md">
                                            <User className="h-3.5 w-3.5" />
                                            <span>Driver: <strong>{selectedVehicle.driver}</strong></span>
                                        </div>
                                    )}
                                </div>

                                <SearchableSelect
                                    label="Route (Optional)"
                                    name="vehicle_route_id"
                                    value={data.vehicle_route_id}
                                    onChange={handleRouteChange}
                                    options={routes?.map((r: any) => ({
                                        label: r.label,
                                        value: r.value
                                    })) || []}
                                    placeholder="Search route..."
                                    error={errors.vehicle_route_id}
                                />
                            </div>

                            {/* Schedule Type, Priority & Department */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SearchableSelect
                                    label="Schedule Type"
                                    name="schedule_type"
                                    value={data.schedule_type}
                                    onChange={(value) => setData('schedule_type', value)}
                                    options={[
                                        { label: 'Pick and Drop', value: 'pick-and-drop' },
                                        { label: 'Engineer', value: 'engineer' },
                                        { label: 'Training', value: 'training' },
                                        { label: 'Ad-hoc', value: 'adhoc' },
                                        { label: 'Reposition', value: 'reposition' }
                                    ]}
                                    placeholder="Search schedule type..."
                                    required
                                    error={errors.schedule_type}
                                />

                                <SearchableSelect
                                    label="Priority"
                                    name="priority"
                                    value={data.priority}
                                    onChange={(value) => setData('priority', value)}
                                    options={[
                                        { label: 'Low', value: 'low' },
                                        { label: 'Medium', value: 'medium' },
                                        { label: 'High', value: 'high' },
                                        { label: 'Urgent', value: 'urgent' }
                                    ]}
                                    placeholder="Search priority..."
                                    required
                                    error={errors.priority}
                                />
                            </div>

                            {/* Purpose & Description */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormTextarea
                                    label="Purpose"
                                    name="purpose"
                                    value={data.purpose}
                                    onChange={(value) => setData('purpose', value)}
                                    placeholder="Enter trip purpose"
                                    rows={3}
                                    required
                                    error={errors.purpose}
                                />

                                <FormTextarea
                                    label="Description"
                                    name="description"
                                    value={data.description}
                                    onChange={(value) => setData('description', value)}
                                    placeholder="Enter trip description"
                                    rows={3}
                                    error={errors.description}
                                />
                            </div>
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
                                    <div className="relative">
                                        <Input
                                            id="scheduled_date"
                                            type="date"
                                            value={data.scheduled_date}
                                            onChange={(e) => setData('scheduled_date', e.target.value)}
                                            className="pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                        />
                                        <Calendar
                                            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none"
                                        />
                                    </div>
                                    {errors.scheduled_date && <p className="text-sm text-red-500">{errors.scheduled_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_start_time">Start Time *</Label>
                                    <div className="relative">
                                        <Input
                                            id="scheduled_start_time"
                                            type="time"
                                            value={data.scheduled_start_time}
                                            onChange={(e) => setData('scheduled_start_time', e.target.value)}
                                            className="pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                        />
                                        <Clock
                                            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none"
                                        />
                                    </div>
                                    {errors.scheduled_start_time && <p className="text-sm text-red-500">{errors.scheduled_start_time}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_end_time">End Time *</Label>
                                    <div className="relative">
                                        <Input
                                            id="scheduled_end_time"
                                            type="time"
                                            value={data.scheduled_end_time}
                                            onChange={(e) => setData('scheduled_end_time', e.target.value)}
                                            className="pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                        />
                                        <Clock
                                            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none"
                                        />
                                    </div>
                                    {errors.scheduled_end_time && <p className="text-sm text-red-500">{errors.scheduled_end_time}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Passengers */}
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex-1">
                                    <CardTitle className="flex items-center gap-2">
                                        <UserPlus className="h-5 w-5" />
                                        Passengers
                                        {selectedPassengerIds.length > 0 && (
                                            <Badge variant="secondary" className="ml-2">
                                                {selectedPassengerIds.length} selected
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription>Search and add passengers to this trip</CardDescription>
                                </div>
                                <div className="w-full sm:w-80">
                                    <MultiSelect
                                        options={employees?.map((emp: any) => ({
                                            label: `${emp.employee_id ? `[${emp.employee_id}] ` : ''}${emp.label}${emp.department ? ` (${emp.department})` : ''}`,
                                            value: emp.value
                                        })) || []}
                                        value={selectedPassengerIds}
                                        onChange={setSelectedPassengerIds}
                                        placeholder="Select passengers..."
                                        searchPlaceholder="Search by name or ID..."
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {selectedPassengerIds.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                    <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm font-medium">No passengers added yet</p>
                                    <p className="text-xs mt-0.5">Select employees from the dropdown above</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {data.passengers.map((passenger, index) => {
                                        const employeeDetails = getEmployeeDetails(passenger.user_id);
                                        return (
                                            <div key={passenger.user_id} className="relative group">
                                                <Card className="hover:shadow-md transition-all h-full">
                                                    <CardHeader className="p-3 pb-2">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-start gap-2 flex-1 min-w-0">
                                                                {/* Passenger Number Badge */}
                                                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-xs font-bold text-white">
                                                                    {index + 1}
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    {/* Employee Name */}
                                                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate leading-tight">
                                                                        {employeeDetails.name}
                                                                    </h4>

                                                                    {/* Employee ID & Department in one line */}
                                                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                                        {employeeDetails.employeeId && (
                                                                            <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 h-4">
                                                                                {employeeDetails.employeeId}
                                                                            </Badge>
                                                                        )}
                                                                        {employeeDetails.department && (
                                                                            <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                                                                                {employeeDetails.department}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Remove Button */}
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setSelectedPassengerIds(prev =>
                                                                    prev.filter(id => id.toString() !== passenger.user_id.toString())
                                                                )}
                                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                            >
                                                                <X className="h-3 w-3" />
                                                                <span className="sr-only">Remove</span>
                                                            </Button>
                                                        </div>
                                                    </CardHeader>

                                                    {/* Stops Selection */}
                                                    {selectedRoute && (
                                                        <CardContent className="p-3 pt-0 space-y-2">
                                                            <div className="space-y-1">
                                                                <Label htmlFor={`pickup-${passenger.user_id}`} className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                                                                    Pickup
                                                                </Label>
                                                                <Select
                                                                    value={passenger.pickup_stop_id}
                                                                    onValueChange={(value) => updatePassenger(passenger.user_id, 'pickup_stop_id', value)}
                                                                >
                                                                    <SelectTrigger id={`pickup-${passenger.user_id}`} className="h-8 text-xs">
                                                                        <SelectValue placeholder="Select stop" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {selectedRoute.stops?.map((stop: any) => (
                                                                            <SelectItem key={stop.id} value={stop.id.toString()}>
                                                                                <span className="flex items-center gap-1.5">
                                                                                    <Badge variant="outline" className="text-[10px] px-1">
                                                                                        {stop.order}
                                                                                    </Badge>
                                                                                    <span className="text-xs">{stop.name}</span>
                                                                                </span>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <Label htmlFor={`dropoff-${passenger.user_id}`} className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                                                                    Dropoff
                                                                </Label>
                                                                <Select
                                                                    value={passenger.dropoff_stop_id}
                                                                    onValueChange={(value) => updatePassenger(passenger.user_id, 'dropoff_stop_id', value)}
                                                                >
                                                                    <SelectTrigger id={`dropoff-${passenger.user_id}`} className="h-8 text-xs">
                                                                        <SelectValue placeholder="Select stop" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {selectedRoute.stops?.map((stop: any) => (
                                                                            <SelectItem key={stop.id} value={stop.id.toString()}>
                                                                                <span className="flex items-center gap-1.5">
                                                                                    <Badge variant="outline" className="text-[10px] px-1">
                                                                                        {stop.order}
                                                                                    </Badge>
                                                                                    <span className="text-xs">{stop.name}</span>
                                                                                </span>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </CardContent>
                                                    )}
                                                </Card>
                                            </div>
                                        );
                                    })}
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
                            onClick={() => router.visit(route('trips.index'))}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Trip'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
