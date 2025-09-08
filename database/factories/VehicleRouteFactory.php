<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VehicleRoute>
 */
class VehicleRouteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $routeTypes = [
            'Express', 'Local', 'Shuttle', 'Direct', 'Circular',
            'Limited', 'Rapid', 'Regular', 'Special', 'Premium'
        ];

        $destinations = [
            'Downtown - Airport', 'University - Mall', 'Hospital - Station',
            'Business District - Residential', 'Shopping Center - Terminal',
            'Industrial Area - City Center', 'Suburbs - Downtown',
            'East Side - West Side', 'North Terminal - South Plaza',
            'Central Hub - Outer Ring', 'Metro Station - Bus Depot',
            'Tourist Area - Hotel District', 'Sports Complex - Arena',
            'Tech Park - Innovation Center', 'Medical Campus - Clinic'
        ];

        $routeName = fake()->randomElement($routeTypes) . ' Route ' . fake()->numberBetween(1, 99);
        $description = 'Route connecting ' . fake()->randomElement($destinations);

        $remarks = [
            'Peak hours: 7-9 AM, 5-7 PM',
            'Weekend service available',
            'Limited stops during rush hour',
            'Air-conditioned vehicles',
            'Wheelchair accessible',
            'Express service during weekdays',
            'Scenic route with city views',
            'Direct connection to main terminals',
            'Tourist-friendly route',
            'Business district coverage'
        ];

        return [
            'name' => $routeName,
            'description' => $description,
            'remarks' => fake()->randomElement([null, fake()->randomElement($remarks)]),
        ];
    }
}
