<?php

namespace App\Observers;

use App\Models\Vehicle;
use App\Models\VehicleDriverAssignment;

class VehicleObserver
{
    /**
     * Handle the Vehicle "created" event.
     */
    public function created(Vehicle $vehicle): void
    {
        if ($vehicle->driver_id) {
            VehicleDriverAssignment::create([
                'vehicle_id'  => $vehicle->id,
                'driver_id'   => $vehicle->driver_id,
                'started_at'  => now(),
                'is_current'  => true,
                'assigned_by' => auth()->id(),
            ]);
        }
    }

    /**
     * Handle the Vehicle "updating" event.
     */
    public function updating(Vehicle $vehicle): void
    {
        if ($vehicle->isDirty('driver_id')) {
            $now = now();

            // Close previous current assignment for this vehicle (if any)
            $prev = $vehicle->driverAssignments()
                ->where('is_current', true)
                ->latest('started_at')
                ->first();

            if ($prev) {
                $prev->update([
                    'ended_at'   => $now,
                    'is_current' => false,
                ]);
            }

            // Create new current assignment for the new driver
            if ($vehicle->driver_id) {
                VehicleDriverAssignment::create([
                    'vehicle_id'  => $vehicle->id,
                    'driver_id'   => $vehicle->driver_id,
                    'started_at'  => $now,
                    'is_current'  => true,
                    'assigned_by' => auth()->id(),
                ]);
            }
        }
    }
}
