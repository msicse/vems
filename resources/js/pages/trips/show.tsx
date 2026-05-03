import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem, Trip, TripPassenger, TripPassengerEvent } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    Car,
    CheckCircle,
    ClipboardList,
    Clock,
    Edit,
    FileText,
    Filter,
    Flag,
    History,
    MapPin,
    MessageSquare,
    Play,
    RefreshCw,
    User,
    Users,
    XCircle,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Trips', href: '/trips' },
    { title: 'Trip Details', href: '#' },
];

type AttendanceMode = 'check_in' | 'check_out' | 'no_show' | 'correct';

type AttendanceTripPassenger = TripPassenger & {
    passenger_events?: TripPassengerEvent[];
};

type AttendanceFormShape = {
    event_type: 'check_in' | 'check_out' | 'no_show' | 'manual_override';
    event_time: string;
    stop_id: string;
    latitude: string;
    longitude: string;
    gps_accuracy_meters: string;
    area_name: string;
    device_id: string;
    reason: string;
    idempotency_key: string;
};

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

const getPassengerStatusBadge = (status?: AttendanceTripPassenger['status']) => {
    const config = {
        pending: 'bg-slate-100 text-slate-800 border-slate-200',
        confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
        boarded: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        completed: 'bg-green-100 text-green-800 border-green-200',
        cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
        no_show: 'bg-rose-100 text-rose-800 border-rose-200',
    } as const;

    const value = status ?? 'pending';

    return (
        <Badge variant="outline" className={`${config[value] ?? config.pending} capitalize`}>
            {value.replace('_', ' ')}
        </Badge>
    );
};

const getEventBadge = (event: TripPassengerEvent) => {
    const config: Record<TripPassengerEvent['event_type'], string> = {
        check_in: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        check_out: 'bg-blue-100 text-blue-800 border-blue-200',
        no_show: 'bg-rose-100 text-rose-800 border-rose-200',
        manual_override: 'bg-amber-100 text-amber-800 border-amber-200',
        correction: 'bg-violet-100 text-violet-800 border-violet-200',
    };

    return (
        <Badge variant="outline" className={`${config[event.event_type]} capitalize`}>
            {event.event_type.replace('_', ' ')}
        </Badge>
    );
};

const formatDateTime = (value?: string | null) => {
    if (!value) {
        return 'Not captured';
    }

    return new Date(value).toLocaleString();
};

const toLocalDateTimeValue = (value?: string | null) => {
    const date = value ? new Date(value) : new Date();
    const normalizedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

    return normalizedDate.toISOString().slice(0, 16);
};

const getDefaultStopId = (mode: AttendanceMode, passenger: AttendanceTripPassenger, event?: TripPassengerEvent) => {
    if (event?.stop_id) {
        return String(event.stop_id);
    }

    if (mode === 'check_in') {
        return passenger.pickup_stop_id ? String(passenger.pickup_stop_id) : '';
    }

    if (mode === 'check_out') {
        return passenger.dropoff_stop_id ? String(passenger.dropoff_stop_id) : '';
    }

    return '';
};

/**
 * Check if the current user has a specific permission
 */
const checkPermission = (permission: string, permissions: string[] = []): boolean => {
    return permissions.includes(permission);
};

const buildFormDefaults = (mode: AttendanceMode, passenger: AttendanceTripPassenger, event?: TripPassengerEvent): AttendanceFormShape => ({
    event_type: (mode === 'correct' ? event?.event_type : mode) === 'check_out' ? 'check_out' : (mode === 'correct' ? event?.event_type : mode) === 'no_show' ? 'no_show' : 'check_in',
    event_time: toLocalDateTimeValue(event?.event_time),
    stop_id: getDefaultStopId(mode, passenger, event),
    latitude: event?.latitude ? String(event.latitude) : '',
    longitude: event?.longitude ? String(event.longitude) : '',
    gps_accuracy_meters: event?.gps_accuracy_meters ? String(event.gps_accuracy_meters) : '',
    area_name: event?.area_name ?? '',
    device_id: event?.device_id ?? '',
    reason: '',
    idempotency_key: '',
});

export default function ShowTrip({ trip }: { trip: Trip }) {
    const pageProps = usePage().props as unknown as { auth?: { user?: unknown; permissions?: string[]; roles?: string[] } };
    const permissions = pageProps.auth?.permissions ?? [];
    const passengers = (trip.passengers ?? []) as AttendanceTripPassenger[];
    const canManageAttendance = !['cancelled', 'rejected'].includes(trip.status);
    const canCaptureAttendance = checkPermission('capture-passenger-attendance', permissions);
    const canCorrectAttendance = checkPermission('correct-passenger-attendance', permissions);
    const [dialogState, setDialogState] = useState<{
        mode: AttendanceMode;
        passenger: AttendanceTripPassenger;
        event?: TripPassengerEvent;
    } | null>(null);
    const [startTripOpen, setStartTripOpen] = useState(false);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<AttendanceFormShape>({
        event_type: 'check_in',
        event_time: toLocalDateTimeValue(),
        stop_id: '',
        latitude: '',
        longitude: '',
        gps_accuracy_meters: '',
        area_name: '',
        device_id: '',
        reason: '',
        idempotency_key: '',
    });
    const {
        data: startTripData,
        setData: setStartTripData,
        post: postStartTrip,
        processing: startTripProcessing,
        errors: startTripErrors,
        reset: resetStartTrip,
        clearErrors: clearStartTripErrors,
    } = useForm<{ odometer_start: string }>({
        odometer_start: '',
    });

    const attendanceSummary = {
        totalPassengers: passengers.length,
        pending: passengers.filter((passenger) => (passenger.status ?? 'pending') === 'pending').length,
        boarded: passengers.filter((passenger) => passenger.status === 'boarded').length,
        completed: passengers.filter((passenger) => passenger.status === 'completed').length,
        noShow: passengers.filter((passenger) => passenger.status === 'no_show').length,
        totalEvents: passengers.reduce((total, passenger) => total + (passenger.passenger_events?.length ?? 0), 0),
        invalidEvents: passengers.reduce(
            (total, passenger) => total + (passenger.passenger_events?.filter((event) => !event.is_valid).length ?? 0),
            0,
        ),
    };

    const allAttendanceEvents = passengers
        .flatMap((passenger) =>
            (passenger.passenger_events ?? []).map((event) => ({
                passenger,
                event,
            })),
        )
        .sort((left, right) => new Date(right.event.event_time).getTime() - new Date(left.event.event_time).getTime());

    // Collect unique sources and passenger names for filter dropdowns
    const uniqueSources = useMemo(
        () => [...new Set(allAttendanceEvents.map((e) => e.event.source).filter(Boolean))] as string[],
        [allAttendanceEvents],
    );

    // Filter state
    const [filterEventTypes, setFilterEventTypes] = useState<string[]>([]);
    const [filterValidity, setFilterValidity] = useState<'all' | 'valid' | 'voided'>('all');
    const [filterSources, setFilterSources] = useState<string[]>([]);
    const [filterPassengerId, setFilterPassengerId] = useState<string>('');
    const [filterDateFrom, setFilterDateFrom] = useState<string>('');
    const [filterDateTo, setFilterDateTo] = useState<string>('');
    const [filterAreaSearch, setFilterAreaSearch] = useState<string>('');
    const [filtersOpen, setFiltersOpen] = useState(false);

    const hasActiveFilters =
        filterEventTypes.length > 0 ||
        filterValidity !== 'all' ||
        filterSources.length > 0 ||
        filterPassengerId !== '' ||
        filterDateFrom !== '' ||
        filterDateTo !== '' ||
        filterAreaSearch !== '';

    const attendanceEvents = useMemo(() => {
        return allAttendanceEvents.filter(({ passenger, event }) => {
            if (filterEventTypes.length > 0 && !filterEventTypes.includes(event.event_type)) return false;
            if (filterValidity === 'valid' && !event.is_valid) return false;
            if (filterValidity === 'voided' && event.is_valid) return false;
            if (filterSources.length > 0 && !filterSources.includes(event.source ?? '')) return false;
            if (filterPassengerId && String(passenger.user?.id ?? passenger.user_id) !== filterPassengerId) return false;
            if (filterAreaSearch && !event.area_name?.toLowerCase().includes(filterAreaSearch.toLowerCase())) return false;
            if (filterDateFrom) {
                const eventDate = new Date(event.event_time);
                const fromDate = new Date(filterDateFrom);
                if (eventDate < fromDate) return false;
            }
            if (filterDateTo) {
                const eventDate = new Date(event.event_time);
                const toDate = new Date(filterDateTo + 'T23:59:59');
                if (eventDate > toDate) return false;
            }
            return true;
        });
    }, [allAttendanceEvents, filterEventTypes, filterValidity, filterSources, filterPassengerId, filterDateFrom, filterDateTo, filterAreaSearch]);

    const resetFilters = () => {
        setFilterEventTypes([]);
        setFilterValidity('all');
        setFilterSources([]);
        setFilterPassengerId('');
        setFilterDateFrom('');
        setFilterDateTo('');
        setFilterAreaSearch('');
    };

    const toggleCheckbox = (list: string[], setList: (v: string[]) => void, value: string) => {
        setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    };

    const openAttendanceDialog = (mode: AttendanceMode, passenger: AttendanceTripPassenger, event?: TripPassengerEvent) => {
        setDialogState({ mode, passenger, event });
        setData(buildFormDefaults(mode, passenger, event));
        clearErrors();
    };

    const closeAttendanceDialog = () => {
        setDialogState(null);
        reset();
        clearErrors();
    };

    const submitAttendance = (submitEvent: FormEvent<HTMLFormElement>) => {
        submitEvent.preventDefault();

        if (!dialogState) {
            return;
        }

        let url = '';

        if (dialogState.mode === 'check_in') {
            url = route('trips.passengers.check-in', [trip.id, dialogState.passenger.id]);
        } else if (dialogState.mode === 'check_out') {
            url = route('trips.passengers.check-out', [trip.id, dialogState.passenger.id]);
        } else if (dialogState.mode === 'no_show') {
            url = route('trips.passengers.no-show', [trip.id, dialogState.passenger.id]);
        } else if (dialogState.event) {
            url = route('trips.passengers.events.correct', [trip.id, dialogState.passenger.id, dialogState.event.id]);
        }

        post(url, {
            preserveScroll: true,
            onSuccess: () => closeAttendanceDialog(),
        });
    };

    const openStartTripDialog = () => {
        setStartTripOpen(true);
        clearStartTripErrors();
    };

    const closeStartTripDialog = () => {
        setStartTripOpen(false);
        resetStartTrip();
        clearStartTripErrors();
    };

    const submitStartTrip = (submitEvent: FormEvent<HTMLFormElement>) => {
        submitEvent.preventDefault();

        postStartTrip(route('trips.start', trip.id), {
            preserveScroll: true,
            onSuccess: () => closeStartTripDialog(),
        });
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Trip ${trip.trip_number}`} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{trip.trip_number}</h1>
                            {getStatusBadge(trip.status)}
                            {getPriorityBadge(trip.priority)}
                        </div>
                        {trip.team_number && <p className="text-sm text-gray-600">Team: {trip.team_number}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        {['pending', 'approved'].includes(trip.status) && (
                            <Button variant="default" onClick={() => router.visit(route('trips.edit', trip.id))}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Trip
                            </Button>
                        )}
                        {['approved', 'assigned'].includes(trip.status) && (
                            <Button className="bg-green-600 hover:bg-green-700" onClick={openStartTripDialog}>
                                <Play className="mr-2 h-4 w-4" />
                                Start Trip
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => router.visit(route('trips.index'))}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Trip Information
                                </CardTitle>
                                <CardDescription>Basic trip details and schedule</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                        <p className="mt-1 text-sm capitalize">{trip.schedule_type.replace('-', ' ')}</p>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
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
                                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
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
                                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    Start Location
                                                </label>
                                                <p className="mt-1 text-sm">{trip.start_location || '-'}</p>
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
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
                                        <p className="mt-1 text-sm">{trip.is_return ? <Badge variant="outline">Yes</Badge> : 'No'}</p>
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

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5" />
                                    Attendance Overview
                                </CardTitle>
                                <CardDescription>Operational snapshot and event history health for this trip.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
                                    <div className="rounded-lg border bg-slate-50 p-3">
                                        <p className="text-xs uppercase tracking-wide text-slate-500">Passengers</p>
                                        <p className="mt-2 text-2xl font-semibold">{attendanceSummary.totalPassengers}</p>
                                    </div>
                                    <div className="rounded-lg border bg-emerald-50 p-3">
                                        <p className="text-xs uppercase tracking-wide text-emerald-700">Boarded</p>
                                        <p className="mt-2 text-2xl font-semibold">{attendanceSummary.boarded}</p>
                                    </div>
                                    <div className="rounded-lg border bg-blue-50 p-3">
                                        <p className="text-xs uppercase tracking-wide text-blue-700">Completed</p>
                                        <p className="mt-2 text-2xl font-semibold">{attendanceSummary.completed}</p>
                                    </div>
                                    <div className="rounded-lg border bg-rose-50 p-3">
                                        <p className="text-xs uppercase tracking-wide text-rose-700">No Show</p>
                                        <p className="mt-2 text-2xl font-semibold">{attendanceSummary.noShow}</p>
                                    </div>
                                    <div className="rounded-lg border bg-amber-50 p-3">
                                        <p className="text-xs uppercase tracking-wide text-amber-700">Events</p>
                                        <p className="mt-2 text-2xl font-semibold">{attendanceSummary.totalEvents}</p>
                                    </div>
                                    <div className="rounded-lg border bg-violet-50 p-3">
                                        <p className="text-xs uppercase tracking-wide text-violet-700">Voided</p>
                                        <p className="mt-2 text-2xl font-semibold">{attendanceSummary.invalidEvents}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

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
                                                <p className="text-sm text-gray-500">{trip.vehicle.brand} {trip.vehicle.model}</p>
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
                                                        {trip.driver.official_phone && <p className="text-sm text-gray-500">{trip.driver.official_phone}</p>}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-gray-500">
                                        <Car className="mx-auto mb-2 h-12 w-12 opacity-30" />
                                        <p className="text-sm">No vehicle assigned yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {passengers.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Passenger Attendance
                                    </CardTitle>
                                    <CardDescription>Capture real pickup and drop events, then correct mistakes without losing history.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {passengers.map((passenger, index) => {
                                            const orderedEvents = [...(passenger.passenger_events ?? [])].sort(
                                                (left, right) => new Date(right.event_time).getTime() - new Date(left.event_time).getTime(),
                                            );
                                            const latestEvent = orderedEvents[0];

                                            return (
                                                <div key={passenger.id} className="rounded-xl border p-4">
                                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                                                                {index + 1}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <p className="text-sm font-semibold">{passenger.user?.name ?? 'Unnamed passenger'}</p>
                                                                    {getPassengerStatusBadge(passenger.status)}
                                                                    <Badge variant="secondary">{orderedEvents.length} events</Badge>
                                                                </div>
                                                                {passenger.user?.employee_id && (
                                                                    <p className="text-xs text-gray-500">Employee ID: {passenger.user.employee_id}</p>
                                                                )}
                                                                <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2">
                                                                    <p>
                                                                        Planned pickup: <span className="font-medium text-gray-900">{passenger.pickup_stop?.name ?? 'Not set'}</span>
                                                                    </p>
                                                                    <p>
                                                                        Planned dropoff: <span className="font-medium text-gray-900">{passenger.dropoff_stop?.name ?? 'Not set'}</span>
                                                                    </p>
                                                                    <p>
                                                                        Actual check-in: <span className="font-medium text-gray-900">{formatDateTime(passenger.boarded_at)}</span>
                                                                    </p>
                                                                    <p>
                                                                        Actual check-out: <span className="font-medium text-gray-900">{formatDateTime(passenger.dropped_at)}</span>
                                                                    </p>
                                                                </div>
                                                                {latestEvent && (
                                                                    <p className="text-xs text-gray-500">
                                                                        Latest event: {latestEvent.event_type.replace('_', ' ')} at {formatDateTime(latestEvent.event_time)}
                                                                        {latestEvent.area_name ? ` from ${latestEvent.area_name}` : ''}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {canManageAttendance && canCaptureAttendance && (
                                                            <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                                                                <Button size="sm" onClick={() => openAttendanceDialog('check_in', passenger)}>
                                                                    Check In
                                                                </Button>
                                                                <Button size="sm" variant="outline" onClick={() => openAttendanceDialog('check_out', passenger)}>
                                                                    Check Out
                                                                </Button>
                                                                <Button size="sm" variant="outline" onClick={() => openAttendanceDialog('no_show', passenger)}>
                                                                    No Show
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {allAttendanceEvents.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <History className="h-5 w-5" />
                                                Attendance Event History
                                                <Badge variant="outline" className="ml-1 font-normal">
                                                    {attendanceEvents.length}{hasActiveFilters ? ` / ${allAttendanceEvents.length}` : ''}
                                                </Badge>
                                            </CardTitle>
                                            <CardDescription className="mt-1">Append-only history with voided records retained for audit and correction.</CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {hasActiveFilters && (
                                                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 gap-1 text-xs">
                                                    <RefreshCw className="h-3 w-3" />
                                                    Clear
                                                </Button>
                                            )}
                                            <Button
                                                variant={filtersOpen ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setFiltersOpen((v) => !v)}
                                                className="h-8 gap-1.5"
                                            >
                                                <Filter className="h-3.5 w-3.5" />
                                                Filters
                                                {hasActiveFilters && (
                                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-[10px] font-bold text-primary">
                                                        {filterEventTypes.length + filterSources.length + (filterValidity !== 'all' ? 1 : 0) + (filterPassengerId ? 1 : 0) + (filterDateFrom ? 1 : 0) + (filterDateTo ? 1 : 0) + (filterAreaSearch ? 1 : 0)}
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-0 p-0">
                                    <div className="flex min-h-0 flex-col lg:flex-row">
                                        {/* Filter Sidebar */}
                                        {filtersOpen && (
                                            <aside className="w-full shrink-0 space-y-5 border-b p-5 lg:w-64 lg:border-b-0 lg:border-r">
                                                {/* Event Type */}
                                                <div>
                                                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Event Type</p>
                                                    <div className="space-y-2">
                                                        {(['check_in', 'check_out', 'no_show', 'manual_override', 'correction'] as const).map((type) => (
                                                            <label key={type} className="flex cursor-pointer items-center gap-2">
                                                                <Checkbox
                                                                    checked={filterEventTypes.includes(type)}
                                                                    onCheckedChange={() => toggleCheckbox(filterEventTypes, setFilterEventTypes, type)}
                                                                />
                                                                <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                <Separator />

                                                {/* Validity */}
                                                <div>
                                                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Validity</p>
                                                    <div className="space-y-2">
                                                        {(['all', 'valid', 'voided'] as const).map((opt) => (
                                                            <label key={opt} className="flex cursor-pointer items-center gap-2">
                                                                <input
                                                                    type="radio"
                                                                    name="event-validity"
                                                                    value={opt}
                                                                    checked={filterValidity === opt}
                                                                    onChange={() => setFilterValidity(opt)}
                                                                    className="h-3.5 w-3.5 accent-primary"
                                                                />
                                                                <span className="text-sm capitalize">{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {uniqueSources.length > 0 && (
                                                    <>
                                                        <Separator />
                                                        {/* Source */}
                                                        <div>
                                                            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source</p>
                                                            <div className="space-y-2">
                                                                {uniqueSources.map((src) => (
                                                                    <label key={src} className="flex cursor-pointer items-center gap-2">
                                                                        <Checkbox
                                                                            checked={filterSources.includes(src)}
                                                                            onCheckedChange={() => toggleCheckbox(filterSources, setFilterSources, src)}
                                                                        />
                                                                        <span className="text-sm capitalize">{src.replace('_', ' ')}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                <Separator />

                                                {/* Passenger */}
                                                <div>
                                                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Passenger</p>
                                                    <select
                                                        value={filterPassengerId}
                                                        onChange={(e) => setFilterPassengerId(e.target.value)}
                                                        className="w-full rounded-md border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                                    >
                                                        <option value="">All passengers</option>
                                                        {passengers.map((p) => (
                                                            <option key={p.id} value={String(p.user?.id ?? p.user_id)}>
                                                                {p.user?.name ?? `Passenger ${p.id}`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <Separator />

                                                {/* Date Range */}
                                                <div>
                                                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date Range</p>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <Label className="mb-1 text-xs text-muted-foreground">From</Label>
                                                            <Input
                                                                type="date"
                                                                value={filterDateFrom}
                                                                onChange={(e) => setFilterDateFrom(e.target.value)}
                                                                className="h-8 text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="mb-1 text-xs text-muted-foreground">To</Label>
                                                            <Input
                                                                type="date"
                                                                value={filterDateTo}
                                                                onChange={(e) => setFilterDateTo(e.target.value)}
                                                                className="h-8 text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <Separator />

                                                {/* Area Search */}
                                                <div>
                                                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Area</p>
                                                    <Input
                                                        type="text"
                                                        placeholder="Search area name…"
                                                        value={filterAreaSearch}
                                                        onChange={(e) => setFilterAreaSearch(e.target.value)}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>

                                                {hasActiveFilters && (
                                                    <>
                                                        <Separator />
                                                        <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={resetFilters}>
                                                            <RefreshCw className="h-3.5 w-3.5" />
                                                            Reset all filters
                                                        </Button>
                                                    </>
                                                )}
                                            </aside>
                                        )}

                                        {/* Event List */}
                                        <div className="flex-1 space-y-3 p-5">
                                            {attendanceEvents.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                                    <Filter className="mb-3 h-8 w-8 text-muted-foreground/40" />
                                                    <p className="text-sm font-medium text-muted-foreground">No events match the current filters</p>
                                                    <Button variant="link" size="sm" className="mt-1" onClick={resetFilters}>
                                                        Clear filters
                                                    </Button>
                                                </div>
                                            ) : (
                                                attendanceEvents.map(({ passenger, event }) => (
                                                    <div key={event.id} className="rounded-xl border p-4">
                                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                            <div className="space-y-2">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    {getEventBadge(event)}
                                                                    {!event.is_valid && <Badge variant="destructive">Voided</Badge>}
                                                                    <span className="text-sm font-medium">{passenger.user?.name ?? 'Unknown passenger'}</span>
                                                                </div>
                                                                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2 xl:grid-cols-3">
                                                                    <p>Time: <span className="font-medium text-gray-900">{formatDateTime(event.event_time)}</span></p>
                                                                    <p>Area: <span className="font-medium text-gray-900">{event.area_name ?? 'Not captured'}</span></p>
                                                                    <p>IP: <span className="font-medium text-gray-900">{event.ip_address ?? 'Not captured'}</span></p>
                                                                    <p>Source: <span className="font-medium text-gray-900">{event.source ?? 'Unknown'}</span></p>
                                                                    <p>Stop: <span className="font-medium text-gray-900">{event.stop?.name ?? 'Not linked'}</span></p>
                                                                    <p>Actor: <span className="font-medium text-gray-900">{event.actor?.name ?? 'System'}</span></p>
                                                                </div>
                                                                {(event.latitude || event.longitude || event.gps_accuracy_meters) && (
                                                                    <p className="text-xs text-gray-500">
                                                                        GPS: {event.latitude ?? '-'}, {event.longitude ?? '-'}
                                                                        {event.gps_accuracy_meters ? ` (accuracy ${event.gps_accuracy_meters}m)` : ''}
                                                                    </p>
                                                                )}
                                                                {!event.is_valid && event.void_reason && (
                                                                    <p className="text-xs text-rose-700">Voided reason: {event.void_reason}</p>
                                                                )}
                                                            </div>
                                                            {canManageAttendance && event.is_valid && canCorrectAttendance && (
                                                                <Button variant="outline" size="sm" onClick={() => openAttendanceDialog('correct', passenger, event)}>
                                                                    Correct Event
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

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
                                        {trip.factories.map((factory) => (
                                            <Badge key={factory.id} variant="outline" className="flex items-center gap-1.5">
                                                <Building2 className="h-3 w-3" />
                                                {factory.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

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
                                        {trip.departments.map((dept) => (
                                            <div key={dept.id} className="flex items-center gap-2 rounded-full border bg-muted/30 px-3 py-1.5">
                                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-sm font-medium">{dept.name}</span>
                                                <span className="text-sm text-muted-foreground">× {dept.pivot?.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

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
                                        {trip.logistics.map((log) => (
                                            <Badge key={log.id} variant="secondary">
                                                {log.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

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

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Request Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Requested By</label>
                                    <p className="mt-1 text-sm font-medium">{trip.requester?.name}</p>
                                    <p className="text-xs text-gray-500">{new Date(trip.created_at).toLocaleDateString()}</p>
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

                        {['pending', 'approved', 'assigned'].includes(trip.status) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {trip.status === 'pending' && (
                                        <>
                                            <Button onClick={() => router.post(route('trips.approve', trip.id))} className="w-full bg-green-600 hover:bg-green-700">
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
                                        </>
                                    )}

                                    {['approved', 'assigned'].includes(trip.status) && (
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700"
                                            onClick={openStartTripDialog}
                                            disabled={startTripProcessing}
                                        >
                                            <Play className="mr-2 h-4 w-4" />
                                            Start Trip
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={startTripOpen} onOpenChange={(open) => !open && closeStartTripDialog()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Start Trip</DialogTitle>
                        <DialogDescription>You can enter current odometer reading now, or skip and add it later.</DialogDescription>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={submitStartTrip}>
                        <div className="space-y-2">
                            <Label htmlFor="odometer_start">Odometer start (optional)</Label>
                            <Input
                                id="odometer_start"
                                type="number"
                                min="0"
                                step="0.01"
                                value={startTripData.odometer_start}
                                onChange={(event) => setStartTripData('odometer_start', event.target.value)}
                                placeholder="Leave blank if not available"
                            />
                            <InputError message={startTripErrors.odometer_start} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeStartTripDialog} disabled={startTripProcessing}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={startTripProcessing}>
                                <Play className="mr-2 h-4 w-4" />
                                {startTripProcessing ? 'Starting...' : 'Start Trip'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={dialogState !== null} onOpenChange={(open) => !open && closeAttendanceDialog()}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {dialogState?.mode === 'check_in' && 'Record Check-In'}
                            {dialogState?.mode === 'check_out' && 'Record Check-Out'}
                            {dialogState?.mode === 'no_show' && 'Record No-Show'}
                            {dialogState?.mode === 'correct' && 'Correct Attendance Event'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogState?.passenger.user?.name ?? 'Passenger'} for trip {trip.trip_number}
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={submitAttendance}>
                        {dialogState?.mode === 'correct' && (
                            <div className="space-y-2">
                                <Label htmlFor="event_type">Replacement event type</Label>
                                <select
                                    id="event_type"
                                    value={data.event_type}
                                    onChange={(event) => setData('event_type', event.target.value as AttendanceFormShape['event_type'])}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="check_in">Check In</option>
                                    <option value="check_out">Check Out</option>
                                    <option value="no_show">No Show</option>
                                    <option value="manual_override">Manual Override</option>
                                </select>
                                <InputError message={errors.event_type} />
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="event_time">Event time</Label>
                                <Input id="event_time" type="datetime-local" value={data.event_time} onChange={(event) => setData('event_time', event.target.value)} />
                                <InputError message={errors.event_time} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stop_id">Stop</Label>
                                <select
                                    id="stop_id"
                                    value={data.stop_id}
                                    onChange={(event) => setData('stop_id', event.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">No linked stop</option>
                                    {dialogState?.passenger.pickup_stop_id && dialogState.passenger.pickup_stop && (
                                        <option value={dialogState.passenger.pickup_stop_id}>Pickup: {dialogState.passenger.pickup_stop.name}</option>
                                    )}
                                    {dialogState?.passenger.dropoff_stop_id && dialogState.passenger.dropoff_stop && dialogState.passenger.dropoff_stop_id !== dialogState.passenger.pickup_stop_id && (
                                        <option value={dialogState.passenger.dropoff_stop_id}>Dropoff: {dialogState.passenger.dropoff_stop.name}</option>
                                    )}
                                </select>
                                <InputError message={errors.stop_id} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="area_name">Area or landmark</Label>
                                <Input id="area_name" value={data.area_name} onChange={(event) => setData('area_name', event.target.value)} placeholder="Factory gate, terminal, checkpoint" />
                                <InputError message={errors.area_name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="device_id">Device ID</Label>
                                <Input id="device_id" value={data.device_id} onChange={(event) => setData('device_id', event.target.value)} placeholder="Driver phone or scanner ID" />
                                <InputError message={errors.device_id} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input id="latitude" value={data.latitude} onChange={(event) => setData('latitude', event.target.value)} placeholder="23.8103" />
                                <InputError message={errors.latitude} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input id="longitude" value={data.longitude} onChange={(event) => setData('longitude', event.target.value)} placeholder="90.4125" />
                                <InputError message={errors.longitude} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gps_accuracy_meters">GPS accuracy (meters)</Label>
                                <Input id="gps_accuracy_meters" value={data.gps_accuracy_meters} onChange={(event) => setData('gps_accuracy_meters', event.target.value)} placeholder="15" />
                                <InputError message={errors.gps_accuracy_meters} />
                            </div>
                            {dialogState?.mode !== 'correct' && (
                                <div className="space-y-2">
                                    <Label htmlFor="idempotency_key">Idempotency key</Label>
                                    <Input id="idempotency_key" value={data.idempotency_key} onChange={(event) => setData('idempotency_key', event.target.value)} placeholder="Optional retry key" />
                                    <InputError message={errors.idempotency_key} />
                                </div>
                            )}
                        </div>

                        {dialogState?.mode === 'correct' && (
                            <div className="space-y-2">
                                <Label htmlFor="reason">Correction reason</Label>
                                <Textarea id="reason" value={data.reason} onChange={(event) => setData('reason', event.target.value)} placeholder="Why is the original event being corrected?" rows={4} />
                                <InputError message={errors.reason} />
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeAttendanceDialog}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : dialogState?.mode === 'correct' ? 'Apply Correction' : 'Save Event'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppSidebarLayout>
    );
}
