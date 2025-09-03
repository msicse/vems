<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Product;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create products first
        Product::factory(200)->create();

        $this->call([
            DepartmentSeeder::class,
            UserSeeder::class, // UserSeeder should handle VMS user fields
            VehicleSeeder::class,
            VendorSeeder::class,
        ]);
    }
}
