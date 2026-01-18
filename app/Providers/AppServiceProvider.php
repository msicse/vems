<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use App\Models\Vehicle;
use App\Models\Trip;
use App\Observers\VehicleObserver;
use App\Observers\TripObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Fix for MySQL key length error with utf8mb4
        Schema::defaultStringLength(191);

        Gate::before(function ($user, $ability) {
            return $user->hasRole('super-admin') ? true : null;
        });

        // Observe vehicle changes to track driver assignments
        Vehicle::observe(VehicleObserver::class);

        // Observe trip changes to track vehicle assignments
        Trip::observe(TripObserver::class);
    }
}
