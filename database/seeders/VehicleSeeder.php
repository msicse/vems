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
                'vendor_id' => null,
                'vehicle_type' => 'sedan',
                'rental_type' => 'own',
                'is_active' => true,
            ],
            [
                'brand' => 'Honda',
                'model' => 'Civic',
                'color' => 'Blue',
                'registration_number' => 'DEF-456',
                'vendor_id' => null,
                'vehicle_type' => 'sedan',
                'rental_type' => 'pool',
                'is_active' => true,
            ],
            [
                'brand' => 'Ford',
                'model' => 'F-150',
                'color' => 'Red',
                'registration_number' => 'GHI-789',
                'vendor_id' => null,
                'vehicle_type' => 'pickup',
                'rental_type' => 'own',
                'is_active' => true,
            ],
            [
                'brand' => 'Chevrolet',
                'model' => 'Suburban',
                'color' => 'Black',
                'registration_number' => 'JKL-012',
                'vendor_id' => null,
                'vehicle_type' => 'suv',
                'rental_type' => 'pool',
                'is_active' => false,
            ],
            [
                'brand' => 'Nissan',
                'model' => 'Altima',
                'color' => 'White',
                'registration_number' => 'MNO-345',
                'vendor_id' => null,
                'vehicle_type' => 'sedan',
                'rental_type' => 'rental',
                'is_active' => true,
            ],
            [
                'brand' => 'BMW',
                'model' => '5 Series',
                'color' => 'Gray',
                'registration_number' => 'PQR-678',
                'vendor_id' => null,
                'vehicle_type' => 'sedan',
                'rental_type' => 'pool',
                'is_active' => true,
            ],
            [
                'brand' => 'Mercedes',
                'model' => 'E-Class',
                'color' => 'Silver',
                'registration_number' => 'STU-901',
                'vendor_id' => null,
                'vehicle_type' => 'sedan',
                'rental_type' => 'pool',
                'is_active' => true,
            ],
            [
                'brand' => 'Audi',
                'model' => 'A6',
                'color' => 'Black',
                'registration_number' => 'VWX-234',
                'vendor_id' => null,
                'vehicle_type' => 'sedan',
                'rental_type' => 'pool',
                'is_active' => false,
            ],
            [
                'brand' => 'Hyundai',
                'model' => 'Sonata',
                'color' => 'Blue',
                'registration_number' => 'YZA-567',
                'vendor_id' => null,
                'vehicle_type' => 'sedan',
                'rental_type' => 'own',
                'is_active' => true,
            ],
            [
                'brand' => 'Kia',
                'model' => 'Optima',
                'color' => 'Red',
                'registration_number' => 'BCD-890',
                'vendor_id' => null,
                'vehicle_type' => 'sedan',
                'rental_type' => 'pool',
                'is_active' => true,
            ],
        ];

        foreach ($vehicles as $vehicle) {
            Vehicle::updateOrCreate(
                ['registration_number' => $vehicle['registration_number']],
                $vehicle
            );
        }

        echo "VMS Vehicles created successfully:\n";
        echo "- 10 vehicles with different types and rental status\n";
    }
}
