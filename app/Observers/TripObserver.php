<?php

namespace App\Observers;

use App\Models\Trip;
use App\Models\TripVehicleAssignment;

class TripObserver
{
    /**
     * Handle the Trip "created" event.
     */
    public function created(Trip $trip): void
    {
        if ($trip->vehicle_id) {
            TripVehicleAssignment::create([
                'trip_id'      => $trip->id,
                'vehicle_id'   => $trip->vehicle_id,
                'assigned_at'  => now(),
                'is_current'   => true,
                'assigned_by'  => auth()->id(),
                'reason'       => 'initial',
            ]);
        }
    }

    /**
     * Handle the Trip "updating" event.
     */
    public function updating(Trip $trip): void
    {
        if ($trip->isDirty('vehicle_id')) {
            $now = now();

            // Close previous current assignment for this trip (if any)
            $prev = $trip->vehicleAssignments()
                ->where('is_current', true)
                ->latest('assigned_at')
                ->first();

            if ($prev) {
                $prev->update([
                    'unassigned_at' => $now,
                    'is_current'    => false,
                ]);
            }

            // Create new current assignment for the new vehicle
            if ($trip->vehicle_id) {
                TripVehicleAssignment::create([
                    'trip_id'      => $trip->id,
                    'vehicle_id'   => $trip->vehicle_id,
                    'assigned_at'  => $now,
                    'is_current'   => true,
                    'assigned_by'  => auth()->id(),
                    'reason'       => 'replacement',
                ]);
            }
        }
    }
}
