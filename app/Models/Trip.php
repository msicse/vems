<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\Department;

class Trip extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'trip_number',
        'vehicle_route_id',
        'vehicle_id',
        'driver_id',
        'department_id',
        'requested_by',
        'approved_by',
        'trip_type',
        'team_number',
        'remarks',
        'description',
        'schedule_type',
        'priority',
        'scheduled_date',
        'scheduled_start_time',
        'scheduled_end_time',
        'start_location',
        'end_location',
        'is_return',
        'is_completed',
        'start_time',
        'end_time',
        'actual_start_time',
        'actual_end_time',
        'odometer_start',
        'odometer_end',
        'actual_duration',
        'fuel_consumed',
        'fuel_cost',
        'other_costs',
        'total_cost',
        'status',
        'cancellation_reason',
        'cancellation_notes',
        'cancelled_by',
        'cancelled_at',
        'comments',
        'driver_rating',
        'vehicle_rating',
        'feedback',
        'rejection_reason',
        'notes',
        'trip_documents',
    ];

    protected function casts(): array
    {
        return [
            'trip_documents' => 'array',
            'is_return' => 'boolean',
            'is_completed' => 'boolean',
            'scheduled_date' => 'date:Y-m-d',
            'scheduled_start_time' => 'string',
            'scheduled_end_time' => 'string',
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'actual_start_time' => 'datetime',
            'actual_end_time' => 'datetime',
            'odometer_start' => 'decimal:2',
            'odometer_end' => 'decimal:2',
            'distance_traveled' => 'decimal:2',
            'fuel_consumed' => 'decimal:2',
            'fuel_cost' => 'decimal:2',
            'other_costs' => 'decimal:2',
            'total_cost' => 'decimal:2',
        ];
    }

    // Relationships
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function vehicleRoute(): BelongsTo
    {
        return $this->belongsTo(VehicleRoute::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function passengers(): HasMany
    {
        return $this->hasMany(TripPassenger::class);
    }

    /**
     * Vehicle assignment history
     */
    public function vehicleAssignments(): HasMany
    {
        return $this->hasMany(TripVehicleAssignment::class);
    }

    /**
     * Current vehicle assignment
     */
    public function currentVehicleAssignment(): HasOne
    {
        return $this->hasOne(TripVehicleAssignment::class)->where('is_current', true)->latestOfMany('assigned_at');
    }
    /**
     * Selected stops for this trip
     */
    public function tripStops(): HasMany
    {
        return $this->hasMany(TripStop::class)->ordered();
    }

    /**
     * Destination stops (final stops) for this trip
     */
    public function destinationStops(): HasMany
    {
        return $this->hasMany(TripStop::class)->destinations()->ordered();
    }
    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    /**
     * Audit log for all trip changes
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(TripAuditLog::class);
    }

    /**
     * Factories associated with this trip
     */
    public function factories(): BelongsToMany
    {
        return $this->belongsToMany(Factory::class, 'factory_trip')
            ->withTimestamps();
    }

    /**
     * Department headcount slots for this trip
     */
    public function departments(): BelongsToMany
    {
        return $this->belongsToMany(Department::class, 'department_trip')
            ->withPivot('count')
            ->withTimestamps();
    }

    /**
     * Logistics assigned to this trip
     */
    public function logistics(): BelongsToMany
    {
        return $this->belongsToMany(Logistics::class, 'trip_logistics')
            ->withTimestamps();
    }

    /**
     * Route assignment history
     */
    public function routeAssignments(): HasMany
    {
        return $this->hasMany(TripRouteAssignment::class);
    }

    /**
     * Current route assignment
     */
    public function currentRouteAssignment(): HasOne
    {
        return $this->hasOne(TripRouteAssignment::class)->where('is_current', true)->latestOfMany('assigned_at');
    }

    // Get driver through vehicle relationship
    public function getDriverAttribute()
    {
        return $this->vehicle?->driver;
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeUpcoming($query)
    {
        return $query->whereIn('status', ['approved', 'assigned'])
            ->where('scheduled_start', '>', now());
    }

    public function scopeToday($query)
    {
        return $query->whereDate('scheduled_start', today());
    }

    // Helper Methods
    public function generateTripNumber(): string
    {
        $date = now()->format('Ymd');
        $count = static::whereDate('created_at', today())->count() + 1;
        return "TRP-{$date}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    public function canBeApproved(): bool
    {
        return $this->status === 'pending';
    }

    public function canBeRejected(): bool
    {
        return in_array($this->status, ['pending', 'approved']);
    }

    public function canBeStarted(): bool
    {
        return in_array($this->status, ['approved', 'assigned']);
    }

    public function canBeCompleted(): bool
    {
        return $this->status === 'in_progress';
    }

    public function canBeCancelled(): bool
    {
        return !in_array($this->status, ['completed', 'cancelled']);
    }

    public function canTransitionTo(string $newStatus): bool
    {
        return match($this->status) {
            'pending' => in_array($newStatus, ['approved', 'rejected', 'cancelled']),
            'approved' => in_array($newStatus, ['assigned', 'rejected', 'cancelled']),
            'assigned' => in_array($newStatus, ['in_progress', 'cancelled']),
            'in_progress' => in_array($newStatus, ['completed', 'cancelled']),
            'completed', 'rejected', 'cancelled' => false,
            default => false,
        };
    }

    public function transitionTo(string $newStatus, ?string $reason = null): bool
    {
        if (!$this->canTransitionTo($newStatus)) {
            return false;
        }

        $oldStatus = $this->status;
        $this->update(['status' => $newStatus]);

        // Log the transition
        TripAuditLog::create([
            'trip_id' => $this->id,
            'user_id' => auth()->id(),
            'action' => 'status_changed',
            'old_values' => ['status' => $oldStatus],
            'new_values' => ['status' => $newStatus],
            'reason' => $reason,
        ]);

        return true;
    }

    public function cancel(string $reason, ?string $notes = null): bool
    {
        if (!$this->canBeCancelled()) {
            return false;
        }

        $this->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
            'cancellation_notes' => $notes,
            'cancelled_by' => auth()->id(),
            'cancelled_at' => now(),
        ]);

        // Log the cancellation
        TripAuditLog::create([
            'trip_id' => $this->id,
            'user_id' => auth()->id(),
            'action' => 'cancelled',
            'old_values' => ['status' => $this->status],
            'new_values' => [
                'status' => 'cancelled',
                'cancellation_reason' => $reason,
                'cancellation_notes' => $notes,
            ],
            'reason' => $notes,
        ]);

        return true;
    }

    public function assignLogistics(int $logisticsId, ?string $notes = null): void
    {
        if (!$this->logistics()->where('logistics_id', $logisticsId)->exists()) {
            $this->logistics()->attach($logisticsId, [
                'assigned_by' => auth()->id(),
                'assigned_at' => now(),
                'notes' => $notes,
            ]);

            // Log the assignment
            TripAuditLog::create([
                'trip_id' => $this->id,
                'user_id' => auth()->id(),
                'action' => 'logistics_assigned',
                'new_values' => ['logistics_id' => $logisticsId, 'notes' => $notes],
                'reason' => $notes,
            ]);
        }
    }

    public function unassignLogistics(int $logisticsId, ?string $reason = null): void
    {
        if ($this->logistics()->where('logistics_id', $logisticsId)->exists()) {
            $this->logistics()->detach($logisticsId);

            // Log the unassignment
            TripAuditLog::create([
                'trip_id' => $this->id,
                'user_id' => auth()->id(),
                'action' => 'logistics_unassigned',
                'old_values' => ['logistics_id' => $logisticsId],
                'reason' => $reason,
            ]);
        }
    }

    public function assignRoute(int $vehicleRouteId, ?string $reason = null, ?string $notes = null): void
    {
        // Mark current route as unassigned
        $this->routeAssignments()->current()->update([
            'is_current' => false,
            'unassigned_at' => now(),
        ]);

        // Create new route assignment
        $assignment = $this->routeAssignments()->create([
            'vehicle_route_id' => $vehicleRouteId,
            'assigned_by' => auth()->id(),
            'assigned_at' => now(),
            'is_current' => true,
            'reason' => $reason,
            'notes' => $notes,
        ]);

        // Log the route change
        TripAuditLog::create([
            'trip_id' => $this->id,
            'user_id' => auth()->id(),
            'action' => 'route_changed',
            'new_values' => [
                'vehicle_route_id' => $vehicleRouteId,
                'reason' => $reason,
                'notes' => $notes,
            ],
            'reason' => $reason,
        ]);
    }

    /**
     * Set trip stops based on selected destinations
     * If no destinations provided, uses the route's end location
     */
    public function setTripStops(array $stopIds = [], ?int $startStopId = null): void
    {
        // Clear existing stops
        $this->tripStops()->delete();

        $stops = [];

        // If start stop is provided, add it first
        if ($startStopId) {
            $stops[] = [
                'stop_id' => $startStopId,
                'stop_order' => 1,
                'is_destination' => false,
            ];
        }

        // Add selected destination stops
        if (!empty($stopIds)) {
            $order = $startStopId ? 2 : 1;
            foreach ($stopIds as $stopId) {
                $stops[] = [
                    'stop_id' => $stopId,
                    'stop_order' => $order++,
                    'is_destination' => true,
                ];
            }
        } else {
            // No destinations selected, use route's end location
            $routeEndStop = $this->getRouteEndStop();
            if ($routeEndStop) {
                $order = $startStopId ? 2 : 1;
                $stops[] = [
                    'stop_id' => $routeEndStop->id,
                    'stop_order' => $order,
                    'is_destination' => true,
                ];
            }
        }

        // Create trip stops
        foreach ($stops as $stopData) {
            $this->tripStops()->create($stopData);
        }

        // Log the stop assignment
        TripAuditLog::create([
            'trip_id' => $this->id,
            'user_id' => auth()->id(),
            'action' => 'stops_assigned',
            'new_values' => [
                'stop_ids' => $stopIds,
                'start_stop_id' => $startStopId,
                'auto_end_stop' => empty($stopIds),
            ],
        ]);
    }

    /**
     * Get the route's end stop (last stop in the route)
     */
    public function getRouteEndStop()
    {
        if ($this->currentRouteAssignment && $this->currentRouteAssignment->vehicleRoute) {
            return $this->currentRouteAssignment->vehicleRoute->routeStops()
                ->orderBy('stop_order', 'desc')
                ->first()?->stop;
        }
        return null;
    }

    /**
     * Get all destination stops for this trip
     */
    public function getDestinationStops()
    {
        return $this->destinationStops;
    }

    /**
     * Get the final destination stop
     */
    public function getFinalDestination()
    {
        return $this->destinationStops()->latest('stop_order')->first();
    }

    /**
     * Start the trip
     */
    public function startTrip(?string $startLocation = null): bool
    {
        if ($this->status !== 'assigned') {
            return false;
        }

        $this->update([
            'status' => 'in_progress',
            'start_time' => now(),
            'start_location' => $startLocation ?? $this->start_location,
            'is_completed' => false,
        ]);

        // Log the trip start
        TripAuditLog::create([
            'trip_id' => $this->id,
            'user_id' => auth()->id(),
            'action' => 'trip_started',
            'new_values' => [
                'start_time' => $this->start_time,
                'start_location' => $this->start_location,
            ],
        ]);

        return true;
    }

    /**
     * Complete the trip
     */
    public function completeTrip(?string $endLocation = null): bool
    {
        if ($this->status !== 'in_progress') {
            return false;
        }

        $this->update([
            'status' => 'completed',
            'end_time' => now(),
            'end_location' => $endLocation ?? $this->end_location,
            'is_completed' => true,
        ]);

        // Log the trip completion
        TripAuditLog::create([
            'trip_id' => $this->id,
            'user_id' => auth()->id(),
            'action' => 'trip_completed',
            'new_values' => [
                'end_time' => $this->end_time,
                'end_location' => $this->end_location,
                'is_completed' => true,
            ],
        ]);

        return true;
    }

    /**
     * Set multiple departments for the trip
     */
    public function setMultipleDepartments(array $departmentIds): void
    {
        $this->update(['multiple_departments' => $departmentIds]);

        TripAuditLog::create([
            'trip_id' => $this->id,
            'user_id' => auth()->id(),
            'action' => 'departments_updated',
            'new_values' => ['departments' => $departmentIds],
        ]);
    }

    /**
     * Get all departments associated with this trip
     */
    public function getAllDepartments()
    {
        $departments = collect();

        // Add primary department
        if ($this->department) {
            $departments->push($this->department);
        }

        // Add multiple departments
        if ($this->multiple_departments) {
            $additionalDepartments = Department::whereIn('id', $this->multiple_departments)->get();
            $departments = $departments->merge($additionalDepartments);
        }

        return $departments->unique('id');
    }

    /**
     * Check if trip is a return trip
     */
    public function isReturnTrip(): bool
    {
        return $this->is_return;
    }

    /**
     * Get trip duration in hours
     */
    public function getTripDuration(): ?float
    {
        if ($this->start_time && $this->end_time) {
            return $this->start_time->diffInHours($this->end_time, true);
        }
        return null;
    }

    /**
     * Get trip type label
     */
    public function getTripTypeLabel(): string
    {
        return match($this->trip_type) {
            'inspection' => 'Inspection',
            'pick-up' => 'Pick-up',
            'drop-off' => 'Drop-off',
            'training' => 'Training',
            'complaints' => 'Complaints',
            'CVV' => 'CVV',
            'Incident Inspection' => 'Incident Inspection',
            'officials' => 'Officials',
            'Assigned' => 'Assigned',
            default => 'General',
        };
    }

    public function isActive(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function getDurationInHours(): ?float
    {
        if ($this->actual_start && $this->actual_end) {
            return $this->actual_start->diffInHours($this->actual_end, true);
        }
        return null;
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'yellow',
            'approved' => 'blue',
            'assigned' => 'cyan',
            'in_progress' => 'purple',
            'completed' => 'green',
            'rejected' => 'red',
            'cancelled' => 'gray',
            default => 'gray',
        };
    }

    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'urgent' => 'red',
            'high' => 'orange',
            'medium' => 'yellow',
            'low' => 'gray',
            default => 'gray',
        };
    }

    // Boot method to auto-generate trip number and audit logging
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($trip) {
            if (empty($trip->trip_number)) {
                $trip->trip_number = $trip->generateTripNumber();
            }
        });

        static::updating(function ($trip) {
            $changes = $trip->getDirty();
            $excludeFields = ['updated_at']; // Fields we don't want to audit

            $auditableChanges = array_diff_key($changes, array_flip($excludeFields));

            if (!empty($auditableChanges)) {
                TripAuditLog::create([
                    'trip_id' => $trip->id,
                    'user_id' => auth()->id() ?? 1, // Fallback for system operations
                    'action' => 'updated',
                    'old_values' => array_intersect_key($trip->getOriginal(), $auditableChanges),
                    'new_values' => $auditableChanges,
                ]);
            }
        });
    }
}
