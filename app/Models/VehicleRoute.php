<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleRoute extends Model
{
    protected $fillable = ['name', 'description', 'remarks'];

    public function routeStops()
    {
        return $this->hasMany(RouteStop::class);
    }
}
