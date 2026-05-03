<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TripRecurringGroup extends Model
{
    protected $fillable = [
        'group_name',
        'created_by',
        'start_date',
        'end_date',
        'total_trips',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    public function trips(): HasMany
    {
        return $this->hasMany(Trip::class, 'recurring_group_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
