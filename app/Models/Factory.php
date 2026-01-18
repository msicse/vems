<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
