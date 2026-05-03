<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Factory extends Model
{
    protected $fillable = [
        'account_id',
        'name',
        'status',
        'address',
        'city',
        'latitude',
        'longitude',
        'mileage_km',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'mileage_km' => 'decimal:2',
    ];

    public function trips(): BelongsToMany
    {
        return $this->belongsToMany(Trip::class, 'factory_trip')
            ->withTimestamps();
    }
}
