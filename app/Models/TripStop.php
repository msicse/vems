<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TripStop extends Model
{
    protected $fillable = [
        'trip_id',
        'stop_id',
        'stop_order',
        'estimated_arrival',
        'actual_arrival',
        'departure_time',
        'is_destination',
        'notes',
    ];

    protected $casts = [
        'estimated_arrival' => 'datetime',
        'actual_arrival' => 'datetime',
        'departure_time' => 'datetime',
        'is_destination' => 'boolean',
    ];

    /**
     * Get the trip that this stop belongs to.
     */
    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    /**
     * Get the stop details.
     */
    public function stop(): BelongsTo
    {
        return $this->belongsTo(Stop::class);
    }

    /**
     * Scope for destination stops only
     */
    public function scopeDestinations($query)
    {
        return $query->where('is_destination', true);
    }

    /**
     * Scope for ordered stops
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('stop_order');
    }

    /**
     * Mark as arrived
     */
    public function markAsArrived(): void
    {
        $this->update(['actual_arrival' => now()]);
    }

    /**
     * Mark as departed
     */
    public function markAsDeparted(): void
    {
        $this->update(['departure_time' => now()]);
    }

    /**
     * Check if stop has been visited
     */
    public function hasArrived(): bool
    {
        return !is_null($this->actual_arrival);
    }

    /**
     * Check if stop has been departed
     */
    public function hasDeparted(): bool
    {
        return !is_null($this->departure_time);
    }
}
