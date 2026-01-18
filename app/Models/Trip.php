<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
        'purpose',
        'description',
        'schedule_type',
        'priority',
        'scheduled_date',
        'scheduled_start_time',
        'scheduled_end_time',
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
            'scheduled_date' => 'date',
            'scheduled_start_time' => 'datetime:H:i',
            'scheduled_end_time' => 'datetime:H:i',
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

    // Boot method to auto-generate trip number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($trip) {
            if (empty($trip->trip_number)) {
                $trip->trip_number = $trip->generateTripNumber();
            }
        });
    }
}
