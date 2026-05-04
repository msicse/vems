<?php

namespace App\Http\Controllers;

use App\Models\RouteStop;
use App\Models\Stop;
use App\Models\VehicleRoute;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VehicleRouteController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:view-routes', only: ['index', 'show']),
            new Middleware('permission:create-routes', only: ['create', 'store']),
            new Middleware('permission:edit-routes', only: ['edit', 'update']),
            new Middleware('permission:delete-routes', only: ['destroy']),
        ];
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // Earth radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat/2) * sin($dLat/2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon/2) * sin($dLon/2);

        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        $distance = $earthRadius * $c;

        return round($distance, 2);
    }

    /**
     * Calculate distances for route stops
     */
    private function calculateRouteDistances($routeId, $stopsData)
    {
        $stops = Stop::whereIn('id', collect($stopsData)->pluck('stop_id'))->get()->keyBy('id');
        $totalDistance = 0;
        $cumulativeDistance = 0;

        foreach ($stopsData as $index => $stopData) {
            $currentStop = $stops->get($stopData['stop_id']);
            $distanceFromPrevious = 0;

            if ($index > 0) {
                // Use manual distance if provided
                if (isset($stopData['manual_distance']) && $stopData['manual_distance'] !== null) {
                    $distanceFromPrevious = (float) $stopData['manual_distance'];
                } elseif ($currentStop && $currentStop->latitude && $currentStop->longitude) {
                    // Calculate distance using coordinates
                    $previousStopData = $stopsData[$index - 1];
                    $previousStop = $stops->get($previousStopData['stop_id']);

                    if ($previousStop && $previousStop->latitude && $previousStop->longitude) {
                        $distanceFromPrevious = $this->calculateDistance(
                            $previousStop->latitude,
                            $previousStop->longitude,
                            $currentStop->latitude,
                            $currentStop->longitude
                        );
                    }
                }

                $totalDistance += $distanceFromPrevious;
            }

            $cumulativeDistance += $distanceFromPrevious;

            // Update or create route stop with distance information
            RouteStop::updateOrCreate(
                [
                    'vehicle_route_id' => $routeId,
                    'stop_id' => $stopData['stop_id'],
                    'stop_order' => $index + 1,
                ],
                [
                    'arrival_time' => $stopData['arrival_time'] ?? null,
                    'departure_time' => $stopData['departure_time'] ?? null,
                    'distance_from_previous' => $distanceFromPrevious,
                    'cumulative_distance' => $cumulativeDistance,
                ]
            );
        }

        return $totalDistance;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = VehicleRoute::with(['routeStops.stop'])->withCount('routeStops');

        // Apply search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('remarks', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortColumn = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortColumn, $sortDirection);

        // Get pagination data
        $perPage = $request->get('per_page', 10);
        $routes = $query->paginate($perPage)
            ->withQueryString();

        // Get stats with reduced query duplication
        $routeStats = VehicleRoute::selectRaw(
            'COUNT(*) as total, ' .
            'SUM(CASE WHEN EXISTS (SELECT 1 FROM route_stops rs WHERE rs.vehicle_route_id = vehicle_routes.id) THEN 1 ELSE 0 END) as routes_with_stops'
        )->first();
        $totalStops = Stop::count();
        $routeStopCount = RouteStop::count();

        $stats = [
            'total' => (int) ($routeStats->total ?? 0),
            'total_stops' => (int) $totalStops,
            'routes_with_stops' => (int) ($routeStats->routes_with_stops ?? 0),
            'avg_stops_per_route' => round($routeStopCount / max((int) ($routeStats->total ?? 0), 1), 1),
        ];

        return Inertia::render('routes/index', [
            'routes' => $routes,
            'stats' => $stats,
            'queryParams' => $request->only(['search', 'sort', 'direction', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get all available stops
        $stops = Stop::orderBy('name')->get();

        return Inertia::render('routes/create', [
            'stops' => $stops,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'remarks' => 'nullable|string',
            'stops' => 'nullable|array',
            'stops.*.stop_id' => 'required|exists:stops,id',
            'stops.*.arrival_time' => 'nullable|date_format:H:i',
            'stops.*.departure_time' => 'nullable|date_format:H:i',
            'stops.*.manual_distance' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            // Create the route
            $route = VehicleRoute::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
            ]);

            // Create route stops with distance calculations if provided
            if (!empty($validated['stops'])) {
                $totalDistance = $this->calculateRouteDistances($route->id, $validated['stops']);

                // Update route with total distance
                $route->update(['total_distance' => $totalDistance]);
            }
        });

        return redirect()
            ->route('routes.index')
            ->with('success', 'Route created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(VehicleRoute $route)
    {
        $route->load(['routeStops.stop']);

        return Inertia::render('routes/show', [
            'route' => $route,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(VehicleRoute $route)
    {
        $route->load(['routeStops.stop']);
        $stops = Stop::orderBy('name')->get();

        return Inertia::render('routes/edit', [
            'route' => $route,
            'stops' => $stops,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, VehicleRoute $route)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'remarks' => 'nullable|string',
            'stops' => 'nullable|array',
            'stops.*.stop_id' => 'required|exists:stops,id',
            'stops.*.arrival_time' => 'nullable|date_format:H:i',
            'stops.*.departure_time' => 'nullable|date_format:H:i',
            'stops.*.manual_distance' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $route) {
            // Update the route
            $route->update([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
            ]);

            // Delete existing route stops
            $route->routeStops()->delete();

            // Create new route stops with distance calculations if provided
            if (!empty($validated['stops'])) {
                $totalDistance = $this->calculateRouteDistances($route->id, $validated['stops']);

                // Update route with total distance
                $route->update(['total_distance' => $totalDistance]);
            } else {
                // No stops, reset total distance
                $route->update(['total_distance' => 0]);
            }
        });

        return redirect()
            ->route('routes.index')
            ->with('success', 'Route updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(VehicleRoute $route)
    {
        // The route stops will be deleted automatically due to cascade delete
        $route->delete();

        return redirect()
            ->route('routes.index')
            ->with('success', 'Route deleted successfully!');
    }
}
