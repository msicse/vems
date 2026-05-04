<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class TripStateController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:approve-trips', only: ['approve', 'reject']),
            new Middleware('permission:edit-trips', only: ['start', 'complete', 'cancel']),
        ];
    }

    /**
     * Approve a trip
     */
    public function approve(Request $request, Trip $trip)
    {
        try {
            if ($trip->status !== 'pending') {
                return back()->with('error', 'Trip cannot be approved in current status.');
            }

            $trip->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
            ]);

            return back()->with('success', 'Trip approved successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to approve trip.');
        }
    }

    /**
     * Reject a trip
     */
    public function reject(Request $request, Trip $trip)
    {
        try {
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
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to reject trip.');
        }
    }

    /**
     * Start a trip
     */
    public function start(Request $request, Trip $trip)
    {
        try {
            if (!in_array($trip->status, ['approved', 'assigned'])) {
                return back()->with('error', 'Trip cannot be started in current status.');
            }

            $validated = $request->validate([
                'odometer_start' => 'nullable|numeric|min:0',
            ]);

            $trip->update([
                'status' => 'in_progress',
                'actual_start_time' => now(),
                'odometer_start' => $validated['odometer_start'] ?? null,
            ]);

            return back()->with('success', 'Trip started successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to start trip.');
        }
    }

    /**
     * Complete a trip
     */
    public function complete(Request $request, Trip $trip)
    {
        try {
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
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to complete trip.');
        }
    }

    /**
     * Cancel a trip
     */
    public function cancel(Request $request, Trip $trip)
    {
        try {
            if (!in_array($trip->status, ['pending', 'approved', 'assigned'])) {
                return back()->with('error', 'Trip cannot be cancelled in current status.');
            }

            $trip->update(['status' => 'cancelled']);

            return back()->with('success', 'Trip cancelled.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to cancel trip.');
        }
    }
}
