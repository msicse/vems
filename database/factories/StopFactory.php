<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Stop>
 */
class StopFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $stopTypes = [
            'Station', 'Terminal', 'Stop', 'Hub', 'Center', 'Plaza',
            'Mall', 'Park', 'Campus', 'Square', 'Junction', 'Depot'
        ];

        $locations = [
            'Downtown', 'Uptown', 'Central', 'East Side', 'West Side',
            'North End', 'South Side', 'Midtown', 'Old Town', 'New City',
            'Riverside', 'Hillside', 'Lakeside', 'Parkside', 'Seaside',
            'University', 'Business District', 'Shopping', 'Medical',
            'Industrial', 'Residential', 'Commercial', 'Historic'
        ];

        $stopName = fake()->randomElement($locations) . ' ' . fake()->randomElement($stopTypes);

        return [
            'name' => $stopName,
            'description' => fake()->sentence(rand(6, 12)),
            'latitude' => fake()->latitude(23.7000, 23.9000), // Bangladesh latitude range
            'longitude' => fake()->longitude(90.3000, 90.5000), // Bangladesh longitude range
        ];
    }
}
