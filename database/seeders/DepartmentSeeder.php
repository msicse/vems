<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Transport Department',
                'code' => 'TRANSPORT',
                'description' => 'Manages all vehicle operations, maintenance, and driver assignments',
                'location' => 'Main Office - Ground Floor',
                'phone' => '+8801711223344',
                'email' => 'transport@company.com',
                'budget_allocation' => json_encode([
                    'monthly_fuel_budget' => 50000,
                    'maintenance_budget' => 30000,
                    'emergency_fund' => 20000
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Human Resources',
                'code' => 'HR',
                'description' => 'Manages employee records, recruitment, and personnel matters',
                'location' => 'Main Office - 2nd Floor',
                'phone' => '+8801711223355',
                'email' => 'hr@company.com',
                'budget_allocation' => json_encode([
                    'recruitment_budget' => 100000,
                    'training_budget' => 50000
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Administration',
                'code' => 'ADMIN',
                'description' => 'General administration and office management',
                'location' => 'Main Office - 1st Floor',
                'phone' => '+8801711223366',
                'email' => 'admin@company.com',
                'budget_allocation' => json_encode([
                    'office_expenses' => 75000,
                    'utilities' => 25000
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Operations',
                'code' => 'OPS',
                'description' => 'Daily operations and project management',
                'location' => 'Main Office - 3rd Floor',
                'phone' => '+8801711223377',
                'email' => 'operations@company.com',
                'budget_allocation' => json_encode([
                    'operational_budget' => 200000,
                    'project_budget' => 150000
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Finance',
                'code' => 'FINANCE',
                'description' => 'Financial management and accounting',
                'location' => 'Main Office - 1st Floor',
                'phone' => '+8801711223388',
                'email' => 'finance@company.com',
                'budget_allocation' => json_encode([
                    'audit_budget' => 30000,
                    'software_budget' => 20000
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('departments')->insert($departments);
    }
}
