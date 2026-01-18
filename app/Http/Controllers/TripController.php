<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\Vehicle;
use App\Models\VehicleRoute;
use App\Models\User;
use App\Models\Department;
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
                    ->orWhere('purpose', 'like', "%{$search}%")
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

        $departments = Department::where('status', 'active')
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

        return Inertia::render('trips/create', [
            'vehicles' => $vehicles,
            'routes' => $routes,
            'departments' => $departments,
            'employees' => $employees,
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
            'purpose' => 'required|string|max:255',
            'description' => 'nullable|string',
            'schedule_type' => 'required|in:pick-and-drop,engineer,training,adhoc,reposition',
            'priority' => 'required|in:low,medium,high,urgent',
            'scheduled_date' => 'required|date',
            'scheduled_start_time' => 'required',
            'scheduled_end_time' => 'required',
            'notes' => 'nullable|string',
            'passengers' => 'nullable|array',
            'passengers.*.user_id' => 'required|exists:users,id',
            'passengers.*.pickup_stop_id' => 'nullable|exists:stops,id',
            'passengers.*.dropoff_stop_id' => 'nullable|exists:stops,id',
        ]);

        DB::beginTransaction();
        try {
            // Create trip
            $trip = Trip::create([
                ...$validated,
                'requested_by' => auth()->id(),
                'status' => 'pending',
            ]);

            // Add passengers if provided
            if (!empty($validated['passengers'])) {
                foreach ($validated['passengers'] as $passenger) {
                    $trip->passengers()->create($passenger);
                }
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
            'vehicleAssignments.assignedBy'
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

        $trip->load('passengers');

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

        $departments = Department::where('status', 'active')
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

        return Inertia::render('trips/edit', [
            'trip' => $trip,
            'vehicles' => $vehicles,
            'routes' => $routes,
            'departments' => $departments,
            'employees' => $employees,
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
            'purpose' => 'required|string|max:255',
            'description' => 'nullable|string',
            'schedule_type' => 'required|in:pick-and-drop,engineer,training,adhoc,reposition',
            'priority' => 'required|in:low,medium,high,urgent',
            'scheduled_date' => 'required|date',
            'scheduled_start_time' => 'required',
            'scheduled_end_time' => 'required',
            'notes' => 'nullable|string',
            'passengers' => 'nullable|array',
            'passengers.*.user_id' => 'required|exists:users,id',
            'passengers.*.pickup_stop_id' => 'nullable|exists:stops,id',
            'passengers.*.dropoff_stop_id' => 'nullable|exists:stops,id',
        ]);

        DB::beginTransaction();
        try {
            $trip->update($validated);

            // Update passengers
            if (isset($validated['passengers'])) {
                // Remove existing passengers
                $trip->passengers()->delete();

                // Add new passengers
                foreach ($validated['passengers'] as $passenger) {
                    $trip->passengers()->create($passenger);
                }
            }

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
