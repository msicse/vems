<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stop extends Model
{
    protected $fillable = ['name', 'description'];

    public function routeStops()
    {
        return $this->hasMany(RouteStop::class);
    }
}
