<?php

namespace Database\Factories;

use App\Models\VehicleRoute;
use App\Models\Stop;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RouteStop>
 */
class RouteStopFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Generate realistic arrival and departure times
        $arrivalHour = fake()->numberBetween(6, 22);
        $arrivalMinute = fake()->randomElement([0, 15, 30, 45]);
        $arrivalTime = sprintf('%02d:%02d', $arrivalHour, $arrivalMinute);

        // Departure time is 2-5 minutes after arrival
        $departureMinutes = $arrivalMinute + fake()->numberBetween(2, 5);
        $departureHour = $arrivalHour;

        if ($departureMinutes >= 60) {
            $departureMinutes -= 60;
            $departureHour += 1;
        }

        $departureTime = sprintf('%02d:%02d', $departureHour, $departureMinutes);

        return [
            'vehicle_route_id' => VehicleRoute::factory(),
            'stop_id' => Stop::factory(),
            'stop_order' => 1, // This will be overridden in the seeder
            'arrival_time' => fake()->randomElement([null, $arrivalTime]),
            'departure_time' => fake()->randomElement([null, $departureTime]),
        ];
    }

    /**
     * Configure the factory to create a route stop with specific order
     */
    public function withOrder(int $order): static
    {
        return $this->state(fn (array $attributes) => [
            'stop_order' => $order,
        ]);
    }

    /**
     * Configure the factory to create a route stop for a specific route
     */
    public function forRoute(int $routeId): static
    {
        return $this->state(fn (array $attributes) => [
            'vehicle_route_id' => $routeId,
        ]);
    }

    /**
     * Configure the factory to create a route stop at a specific stop
     */
    public function atStop(int $stopId): static
    {
        return $this->state(fn (array $attributes) => [
            'stop_id' => $stopId,
        ]);
    }
}
