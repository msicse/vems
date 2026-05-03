<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\Vehicle;
use App\Models\VehicleRoute;
use App\Models\User;
use App\Models\Department;
use App\Models\Factory;
use App\Models\Logistics;
use App\Models\Stop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TripController extends Controller
{
    /**
     * Display a listing of trips
     */
    public function index(Request $request)
    {
        $query = Trip::with([
            'vehicle.driver',
            'vehicleRoute',
            'requester',
            'approver',
            'department',
            'passengers.user'
        ]);

        // Apply search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('trip_number', 'like', "%{$search}%")
                    ->orWhereHas('vehicle', function ($vq) use ($search) {
                        $vq->where('registration_number', 'like', "%{$search}%");
                    })
                    ->orWhereHas('requester', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('schedule_type')) {
            $query->where('schedule_type', $request->schedule_type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('scheduled_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('scheduled_date', '<=', $request->date_to);
        }

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }

        // Apply sorting
        $sortColumn = $request->get('sort', 'scheduled_date');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortColumn, $sortDirection);

        // Paginate
        $trips = $query->paginate($request->get('per_page', 15))
            ->withQueryString();

        // Get stats
        $stats = [
            'total' => Trip::count(),
            'pending' => Trip::where('status', 'pending')->count(),
            'approved' => Trip::where('status', 'approved')->count(),
            'in_progress' => Trip::where('status', 'in_progress')->count(),
            'completed' => Trip::where('status', 'completed')->count(),
            'today' => Trip::whereDate('scheduled_date', today())->count(),
        ];

        return Inertia::render('trips/index', [
            'trips' => $trips,
            'stats' => $stats,
            'queryParams' => $request->only(['search', 'status', 'schedule_type', 'date_from', 'date_to', 'vehicle_id', 'sort', 'direction', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new trip
     */
    public function create()
    {
        $vehicles = Vehicle::with('driver')
            ->where('is_active', true)
            ->get()
            ->map(fn($v) => [
                'value' => $v->id,
                'label' => "{$v->registration_number} - {$v->brand} {$v->model}",
                'driver' => $v->driver ? $v->driver->name : 'No driver assigned'
            ]);

        $routes = VehicleRoute::with('routeStops.stop')
            ->get()
            ->map(fn($r) => [
                'value' => $r->id,
                'label' => $r->name,
                'stops' => $r->routeStops->map(fn($rs) => [
                    'id' => $rs->stop->id,
                    'name' => $rs->stop->name,
                    'order' => $rs->stop_order
                ])
            ]);

        $departments = Department::where('is_active', true)
            ->get()
            ->map(fn($d) => ['value' => $d->id, 'label' => $d->name]);

        $employees = User::where('status', 'active')
            ->get()
            ->map(fn($u) => [
                'value' => $u->id,
                'label' => $u->name,
                'employee_id' => $u->employee_id,
                'department' => $u->department?->name
            ]);

        $userGroups = \App\Models\UserGroup::with('users')
            ->where('status', 'active')
            ->orderBy('name')
            ->get()
            ->map(fn($g) => [
                'value' => $g->id,
                'label' => $g->name,
                'user_ids' => $g->users->pluck('id'),
            ]);

        return Inertia::render('trips/create', [
            'vehicles' => $vehicles,
            'routes' => $routes,
            'departments' => $departments,
            'employees' => $employees,
            'userGroups' => $userGroups,
            'factories' => Factory::where('status', 'active')
                ->orderBy('name')
                ->get()
                ->map(fn($f) => [
                    'value' => $f->id,
                    'label' => "({$f->account_id}) {$f->name}",
                    'city'  => $f->city,
                ]),
            'logistics' => Logistics::active()
                ->orderBy('name')
                ->get()
                ->map(fn($l) => [
                    'value' => $l->id,
                    'label' => $l->name,
                ]),
        ]);
    }

    /**
     * Store a newly created trip
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_route_id' => 'nullable|exists:vehicle_routes,id',
            'vehicle_id' => 'required|exists:vehicles,id',
            'department_id' => 'nullable|exists:departments,id',
            'trip_type' => 'nullable|string',
            'team_number' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'remarks' => 'nullable|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'scheduled_date' => 'required|date',
            'scheduled_start_time' => 'required',
            'scheduled_end_time' => 'required',
            'start_location' => 'nullable|string|max:255',
            'end_location' => 'nullable|string|max:255',
            'is_return' => 'boolean',
            'is_recurring' => 'boolean',
            'recurring_start_date' => 'nullable|date|required_if:is_recurring,true',
            'recurring_end_date' => 'nullable|date|required_if:is_recurring,true|after_or_equal:recurring_start_date',
            'group_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'passengers' => 'nullable|array',
            'passengers.*.user_id' => 'required|exists:users,id',
            'passengers.*.pickup_stop_id' => 'nullable|exists:stops,id',
            'passengers.*.dropoff_stop_id' => 'nullable|exists:stops,id',
            'factory_ids' => 'nullable|array',
            'factory_ids.*' => 'exists:factories,id',
            'department_slots' => 'nullable|array',
            'department_slots.*.department_id' => 'required|exists:departments,id',
            'department_slots.*.count' => 'required|integer|min:1|max:999',
            'logistics_ids' => 'nullable|array',
            'logistics_ids.*' => 'exists:logistics,id',
        ]);

        DB::beginTransaction();
        try {
            // Create trip
            $tripData = collect($validated)
                ->except(['passengers', 'factory_ids', 'department_slots', 'logistics_ids'])
                ->merge(['requested_by' => auth()->id(), 'status' => 'pending'])
                ->toArray();

            $trip = Trip::create($tripData);

            // Add passengers if provided
            if (!empty($validated['passengers'])) {
                foreach ($validated['passengers'] as $passenger) {
                    $trip->passengers()->create($passenger);
                }
            }

            // Attach factories
            if (!empty($validated['factory_ids'])) {
                $trip->factories()->sync($validated['factory_ids']);
            }

            // Attach department headcount slots
            if (!empty($validated['department_slots'])) {
                $syncData = collect($validated['department_slots'])
                    ->keyBy('department_id')
                    ->map(fn($slot) => ['count' => $slot['count']])
                    ->toArray();
                $trip->departments()->sync($syncData);
            }

            // Attach logistics
            if (!empty($validated['logistics_ids'])) {
                $trip->logistics()->sync($validated['logistics_ids']);
            }

            DB::commit();

            return redirect()
                ->route('trips.show', $trip)
                ->with('success', 'Trip created successfully! Awaiting approval.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withErrors(['error' => 'Failed to create trip: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Store multiple recurring trips
     */
    public function storeRecurring(Request $request)
    {
        $validated = $request->validate([
            'vehicle_route_id' => 'nullable|exists:vehicle_routes,id',
            'vehicle_id' => 'required|exists:vehicles,id',
            'department_id' => 'nullable|exists:departments,id',
            'trip_type' => 'nullable|string',
            'team_number' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'remarks' => 'nullable|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'recurring_start_date' => 'required|date',
            'recurring_end_date' => 'required|date|after_or_equal:recurring_start_date',
            'scheduled_start_time' => 'required',
            'scheduled_end_time' => 'required',
            'start_location' => 'nullable|string|max:255',
            'end_location' => 'nullable|string|max:255',
            'is_return' => 'boolean',
            'group_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'passengers' => 'nullable|array',
            'passengers.*.user_id' => 'required|exists:users,id',
            'factory_ids' => 'nullable|array',
            'factory_ids.*' => 'exists:factories,id',
            'department_slots' => 'nullable|array',
            'department_slots.*.department_id' => 'required|exists:departments,id',
            'department_slots.*.count' => 'required|integer|min:1|max:999',
            'logistics_ids' => 'nullable|array',
            'logistics_ids.*' => 'exists:logistics,id',
        ]);

        DB::beginTransaction();
        try {
            $start = \Carbon\Carbon::parse($validated['recurring_start_date']);
            $end   = \Carbon\Carbon::parse($validated['recurring_end_date']);
            $dates = [];
            for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
                $dates[] = $d->toDateString();
            }

            // Create recurring group
            $group = \App\Models\TripRecurringGroup::create([
                'group_name'  => $validated['group_name'] ?? null,
                'created_by'  => auth()->id(),
                'start_date'  => $validated['recurring_start_date'],
                'end_date'    => $validated['recurring_end_date'],
                'total_trips' => count($dates),
                'notes'       => $validated['notes'] ?? null,
            ]);

            $tripBase = collect($validated)->except([
                'passengers', 'factory_ids', 'department_slots', 'logistics_ids',
                'recurring_start_date', 'recurring_end_date', 'group_name',
            ])->merge([
                'requested_by'        => auth()->id(),
                'status'              => 'pending',
                'is_recurring'        => true,
                'recurring_group_id'  => $group->id,
                'recurring_start_date' => $validated['recurring_start_date'],
                'recurring_end_date'   => $validated['recurring_end_date'],
            ])->toArray();

            $firstTrip = null;
            foreach ($dates as $date) {
                $tripData = array_merge($tripBase, ['scheduled_date' => $date]);
                $trip = Trip::create($tripData);

                if ($firstTrip === null) $firstTrip = $trip;

                if (!empty($validated['passengers'])) {
                    foreach ($validated['passengers'] as $passenger) {
                        $trip->passengers()->create($passenger);
                    }
                }
                if (!empty($validated['factory_ids'])) {
                    $trip->factories()->sync($validated['factory_ids']);
                }
                if (!empty($validated['department_slots'])) {
                    $syncData = collect($validated['department_slots'])
                        ->keyBy('department_id')
                        ->map(fn($slot) => ['count' => $slot['count']])
                        ->toArray();
                    $trip->departments()->sync($syncData);
                }
                if (!empty($validated['logistics_ids'])) {
                    $trip->logistics()->sync($validated['logistics_ids']);
                }
            }

            DB::commit();

            return redirect()
                ->route('trips.index')
                ->with('success', count($dates) . ' recurring trips created successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withErrors(['error' => 'Failed to create recurring trips: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified trip
     */
    public function show(Trip $trip)
    {
        $trip->load([
            'vehicle.driver',
            'vehicleRoute.routeStops.stop',
            'requester',
            'approver',
            'department',
            'passengers.user',
            'passengers.pickupStop',
            'passengers.dropoffStop',
            'vehicleAssignments.vehicle',
            'vehicleAssignments.assignedBy',
            'logistics',
            'factories',
            'departments',
        ]);

        $vehicleAssignments = $trip->vehicleAssignments()
            ->orderByDesc('assigned_at')
            ->get();

        // Get active vehicles for reassignment option
        $availableVehicles = Vehicle::where('is_active', true)
            ->with('driver')
            ->get()
            ->map(fn($v) => [
                'value' => $v->id,
                'label' => "{$v->registration_number} - {$v->brand} {$v->model}",
                'driver' => $v->driver ? $v->driver->name : 'No driver assigned'
            ]);

        return Inertia::render('trips/show', [
            'trip' => $trip,
            'vehicleAssignments' => $vehicleAssignments,
            'availableVehicles' => $availableVehicles,
        ]);
    }

    /**
     * Show the form for editing the specified trip
     */
    public function edit(Trip $trip)
    {
        // Can only edit pending or approved trips
        if (!in_array($trip->status, ['pending', 'approved'])) {
            return back()->with('error', 'Cannot edit trip in current status.');
        }

        $trip->load(['passengers', 'logistics', 'factories', 'departments']);

        $vehicles = Vehicle::with('driver')
            ->where('is_active', true)
            ->get()
            ->map(fn($v) => [
                'value' => $v->id,
                'label' => "{$v->registration_number} - {$v->brand} {$v->model}",
                'driver' => $v->driver ? $v->driver->name : 'No driver assigned'
            ]);

        $routes = VehicleRoute::with('routeStops.stop')
            ->get()
            ->map(fn($r) => [
                'value' => $r->id,
                'label' => $r->name,
                'stops' => $r->routeStops->map(fn($rs) => [
                    'id' => $rs->stop->id,
                    'name' => $rs->stop->name,
                    'order' => $rs->stop_order
                ])
            ]);

        $departments = Department::where('is_active', true)
            ->get()
            ->map(fn($d) => ['value' => $d->id, 'label' => $d->name]);

        $employees = User::where('status', 'active')
            ->get()
            ->map(fn($u) => [
                'value' => $u->id,
                'label' => $u->name,
                'employee_id' => $u->employee_id,
                'department' => $u->department?->name
            ]);

        $factories = Factory::where('status', 'active')
            ->orderBy('name')
            ->get()
            ->map(fn($f) => [
                'value' => $f->id,
                'label' => "({$f->account_id}) {$f->name}",
            ]);

        $logistics = Logistics::active()
            ->orderBy('name')
            ->get()
            ->map(fn($l) => [
                'value' => $l->id,
                'label' => $l->name,
            ]);

        return Inertia::render('trips/edit', [
            'trip' => $trip,
            'vehicles' => $vehicles,
            'routes' => $routes,
            'departments' => $departments,
            'employees' => $employees,
            'factories' => $factories,
            'logistics' => $logistics,
        ]);
    }

    /**
     * Update the specified trip
     */
    public function update(Request $request, Trip $trip)
    {
        // Can only update pending or approved trips
        if (!in_array($trip->status, ['pending', 'approved'])) {
            return back()->with('error', 'Cannot update trip in current status.');
        }

        $validated = $request->validate([
            'vehicle_route_id' => 'nullable|exists:vehicle_routes,id',
            'vehicle_id' => 'required|exists:vehicles,id',
            'department_id' => 'nullable|exists:departments,id',
            'trip_type' => 'nullable|string',
            'team_number' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'remarks' => 'nullable|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'scheduled_date' => 'required|date',
            'scheduled_start_time' => 'required',
            'scheduled_end_time' => 'required',
            'start_location' => 'nullable|string|max:255',
            'end_location' => 'nullable|string|max:255',
            'is_return' => 'boolean',
            'notes' => 'nullable|string',
            'passengers' => 'nullable|array',
            'passengers.*.user_id' => 'required|exists:users,id',
            'passengers.*.pickup_stop_id' => 'nullable|exists:stops,id',
            'passengers.*.dropoff_stop_id' => 'nullable|exists:stops,id',
            'factory_ids' => 'nullable|array',
            'factory_ids.*' => 'exists:factories,id',
            'department_slots' => 'nullable|array',
            'department_slots.*.department_id' => 'required|exists:departments,id',
            'department_slots.*.count' => 'required|integer|min:1|max:999',
            'logistics_ids' => 'nullable|array',
            'logistics_ids.*' => 'exists:logistics,id',
        ]);

        DB::beginTransaction();
        try {
            $tripData = collect($validated)
                ->except(['passengers', 'factory_ids', 'department_slots', 'logistics_ids'])
                ->toArray();
            $trip->update($tripData);

            // Update passengers
            if (isset($validated['passengers'])) {
                $trip->passengers()->delete();
                foreach ($validated['passengers'] as $passenger) {
                    $trip->passengers()->create($passenger);
                }
            }

            // Sync factories
            $trip->factories()->sync($validated['factory_ids'] ?? []);

            // Sync department headcount slots
            if (!empty($validated['department_slots'])) {
                $syncData = collect($validated['department_slots'])
                    ->keyBy('department_id')
                    ->map(fn($slot) => ['count' => $slot['count']])
                    ->toArray();
                $trip->departments()->sync($syncData);
            } else {
                $trip->departments()->detach();
            }

            // Sync logistics
            $trip->logistics()->sync($validated['logistics_ids'] ?? []);

            DB::commit();

            return redirect()
                ->route('trips.show', $trip)
                ->with('success', 'Trip updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withErrors(['error' => 'Failed to update trip: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Approve a trip
     */
    public function approve(Request $request, Trip $trip)
    {
        if ($trip->status !== 'pending') {
            return back()->with('error', 'Trip cannot be approved in current status.');
        }

        $trip->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
        ]);

        return back()->with('success', 'Trip approved successfully!');
    }

    /**
     * Reject a trip
     */
    public function reject(Request $request, Trip $trip)
    {
        if (!in_array($trip->status, ['pending', 'approved'])) {
            return back()->with('error', 'Trip cannot be rejected in current status.');
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        $trip->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return back()->with('success', 'Trip rejected.');
    }

    /**
     * Start a trip
     */
    public function start(Request $request, Trip $trip)
    {
        if (!in_array($trip->status, ['approved', 'assigned'])) {
            return back()->with('error', 'Trip cannot be started in current status.');
        }

        $validated = $request->validate([
            'odometer_start' => 'required|numeric|min:0',
        ]);

        $trip->update([
            'status' => 'in_progress',
            'actual_start_time' => now(),
            'odometer_start' => $validated['odometer_start'],
        ]);

        return back()->with('success', 'Trip started successfully!');
    }

    /**
     * Complete a trip
     */
    public function complete(Request $request, Trip $trip)
    {
        if ($trip->status !== 'in_progress') {
            return back()->with('error', 'Trip cannot be completed in current status.');
        }

        $validated = $request->validate([
            'odometer_end' => 'required|numeric|min:' . ($trip->odometer_start ?? 0),
            'fuel_consumed' => 'nullable|numeric|min:0',
            'fuel_cost' => 'nullable|numeric|min:0',
            'other_costs' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        // Calculate total cost
        $totalCost = ($validated['fuel_cost'] ?? 0) + ($validated['other_costs'] ?? 0);

        $trip->update([
            'status' => 'completed',
            'actual_end_time' => now(),
            'odometer_end' => $validated['odometer_end'],
            'fuel_consumed' => $validated['fuel_consumed'] ?? null,
            'fuel_cost' => $validated['fuel_cost'] ?? null,
            'other_costs' => $validated['other_costs'] ?? null,
            'total_cost' => $totalCost,
            'notes' => $validated['notes'] ?? $trip->notes,
        ]);

        // Update driver's total distance if trip has vehicle with driver
        if ($trip->vehicle && $trip->vehicle->driver && $trip->distance_traveled) {
            $trip->vehicle->driver->increment('total_distance_covered', $trip->distance_traveled);
            $trip->vehicle->driver->increment('total_trips_completed');
        }

        return back()->with('success', 'Trip completed successfully!');
    }

    /**
     * Cancel a trip
     */
    public function cancel(Request $request, Trip $trip)
    {
        if (!in_array($trip->status, ['pending', 'approved', 'assigned'])) {
            return back()->with('error', 'Trip cannot be cancelled in current status.');
        }

        $trip->update(['status' => 'cancelled']);

        return back()->with('success', 'Trip cancelled.');
    }

    /**
     * Remove the specified trip
     */
    public function destroy(Trip $trip)
    {
        // Can only delete pending trips
        if ($trip->status !== 'pending') {
            return back()->with('error', 'Only pending trips can be deleted.');
        }

        $trip->delete();

        return redirect()
            ->route('trips.index')
            ->with('success', 'Trip deleted successfully.');
    }

    /**
     * Reassign vehicle to a trip (for damaged/breakdown scenarios)
     */
    public function reassignVehicle(Request $request, Trip $trip)
    {
        // Can reassign vehicle during any active status
        if (!in_array($trip->status, ['pending', 'approved', 'assigned', 'in_progress'])) {
            return back()->with('error', 'Cannot reassign vehicle for completed or cancelled trips.');
        }

        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'reason' => 'required|in:damaged,maintenance,breakdown,replacement,other',
            'notes' => 'nullable|string|max:500',
        ]);

        // Update trip vehicle
        $trip->update([
            'vehicle_id' => $validated['vehicle_id'],
        ]);

        // Update the assignment reason and notes
        $currentAssignment = $trip->currentVehicleAssignment;
        if ($currentAssignment) {
            $currentAssignment->update([
                'reason' => $validated['reason'],
                'notes' => $validated['notes'] ?? null,
            ]);
        }

        return back()->with('success', 'Vehicle reassigned successfully!');
    }
}
