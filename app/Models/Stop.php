<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stop extends Model
{
    use HasFactory;

        protected $fillable = ['name', 'description', 'latitude', 'longitude'];

    public function routeStops()
    {
        return $this->hasMany(RouteStop::class);
    }
}
