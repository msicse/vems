<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TripPassenger extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id',
        'user_id',
        'pickup_stop_id',
        'dropoff_stop_id',
        'status',
        'boarded_at',
        'dropped_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'boarded_at' => 'datetime',
            'dropped_at' => 'datetime',
        ];
    }

    // Relationships
    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function pickupStop(): BelongsTo
    {
        return $this->belongsTo(Stop::class, 'pickup_stop_id');
    }

    public function dropoffStop(): BelongsTo
    {
        return $this->belongsTo(Stop::class, 'dropoff_stop_id');
    }

    // Helper Methods
    public function markAsBoarded(): void
    {
        $this->update([
            'status' => 'boarded',
            'boarded_at' => now(),
        ]);
    }

    public function markAsDropped(): void
    {
        $this->update([
            'status' => 'completed',
            'dropped_at' => now(),
        ]);
    }

    public function markAsNoShow(): void
    {
        $this->update(['status' => 'no_show']);
    }
}
