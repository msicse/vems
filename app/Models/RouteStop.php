<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RouteStop extends Model
{
    use HasFactory;
    protected $fillable = [
        'vehicle_route_id',
        'stop_id',
        'stop_order',
        'arrival_time',
        'departure_time',
        'distance_from_previous',
        'cumulative_distance',
    ];

    public function vehicleRoute()
    {
        return $this->belongsTo(VehicleRoute::class);
    }

    public function stop()
    {
        return $this->belongsTo(Stop::class);
    }
}
