<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Trip extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'trip_number',
        'requested_by',
        'approved_by',
        'vehicle_id',
        'driver_id',
        'department_id',
        'purpose',
        'description',
        'trip_type',
        'priority',
        'start_location',
        'start_latitude',
        'start_longitude',
        'end_location',
        'end_latitude',
        'end_longitude',
        'via_points',
        'estimated_distance',
        'estimated_duration',
        'scheduled_start',
        'scheduled_end',
        'actual_start',
        'actual_end',
        'passenger_count',
        'passenger_list',
        'status',
        'actual_distance',
        'actual_duration',
        'fuel_consumed',
        'trip_cost',
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
            'via_points' => 'array',
            'passenger_list' => 'array',
            'trip_documents' => 'array',
            'scheduled_start' => 'datetime',
            'scheduled_end' => 'datetime',
            'actual_start' => 'datetime',
            'actual_end' => 'datetime',
            'estimated_distance' => 'decimal:2',
            'actual_distance' => 'decimal:2',
            'fuel_consumed' => 'decimal:2',
            'trip_cost' => 'decimal:2',
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

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
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
