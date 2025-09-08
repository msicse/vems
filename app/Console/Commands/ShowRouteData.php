<?php

namespace App\Console\Commands;

use App\Models\VehicleRoute;
use Illuminate\Console\Command;

class ShowRouteData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'route:show-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Display route data with stops';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $routes = VehicleRoute::with('routeStops.stop')->get();

        $this->info('Total Routes: ' . $routes->count());

        foreach ($routes as $route) {
            $this->line('');
            $this->info("Route: {$route->name}");
            $this->line("Description: {$route->description}");
            $this->line("Remarks: " . ($route->remarks ?? 'None'));
            $this->line("Total Stops: " . $route->routeStops->count());

            if ($route->routeStops->count() > 0) {
                $this->line("Stops:");
                foreach ($route->routeStops->sortBy('stop_order') as $routeStop) {
                    $arrival = $routeStop->arrival_time ?? 'N/A';
                    $departure = $routeStop->departure_time ?? 'N/A';
                    $this->line("  {$routeStop->stop_order}. {$routeStop->stop->name} (Arrival: {$arrival}, Departure: {$departure})");
                }
            }
        }

        return 0;
    }
}
