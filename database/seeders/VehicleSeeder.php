<?php

namespace Database\Seeders;

use App\Models\Vehicle;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VehicleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create some realistic sample vehicles
        $vehicles = [
            [
                'brand' => 'Toyota',
                'model' => 'Camry',
                'color' => 'Silver',
                'registration_number' => 'ABC-123',
                'vendor' => 'Toyota Dealership',
                'is_active' => true,
            ],
            [
                'brand' => 'Honda',
                'model' => 'Civic',
                'color' => 'Blue',
                'registration_number' => 'DEF-456',
                'vendor' => 'Honda Motors',
                'is_active' => true,
            ],
            [
                'brand' => 'Ford',
                'model' => 'F-150',
                'color' => 'Red',
                'registration_number' => 'GHI-789',
                'vendor' => 'Ford Trucks',
                'is_active' => true,
            ],
            [
                'brand' => 'Chevrolet',
                'model' => 'Malibu',
                'color' => 'Black',
                'registration_number' => 'JKL-012',
                'vendor' => 'Chevy Dealer',
                'is_active' => false,
            ],
            [
                'brand' => 'Nissan',
                'model' => 'Altima',
                'color' => 'White',
                'registration_number' => 'MNO-345',
                'vendor' => 'Nissan Center',
                'is_active' => true,
            ],
            [
                'brand' => 'BMW',
                'model' => '3 Series',
                'color' => 'Gray',
                'registration_number' => 'PQR-678',
                'vendor' => 'BMW Dealership',
                'is_active' => true,
            ],
            [
                'brand' => 'Mercedes',
                'model' => 'C-Class',
                'color' => 'Silver',
                'registration_number' => 'STU-901',
                'vendor' => 'Mercedes Benz',
                'is_active' => true,
            ],
            [
                'brand' => 'Audi',
                'model' => 'A4',
                'color' => 'Blue',
                'registration_number' => 'VWX-234',
                'vendor' => 'Audi Center',
                'is_active' => false,
            ],
            [
                'brand' => 'Hyundai',
                'model' => 'Elantra',
                'color' => 'Green',
                'registration_number' => 'YZA-567',
                'vendor' => 'Hyundai Motors',
                'is_active' => true,
            ],
            [
                'brand' => 'Kia',
                'model' => 'Optima',
                'color' => 'Orange',
                'registration_number' => 'BCD-890',
                'vendor' => 'Kia Dealership',
                'is_active' => true,
            ],
        ];

        foreach ($vehicles as $vehicle) {
            Vehicle::create($vehicle);
        }

        // Create additional random vehicles using the factory
        Vehicle::factory(15)->create();
    }
}
