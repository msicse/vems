<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleRoute extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'remarks', 'total_distance'];

    public function routeStops()
    {
        return $this->hasMany(RouteStop::class);
    }
}
