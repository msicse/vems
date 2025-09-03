<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        $admin = User::create([
            'name' => 'System Administrator',
            'username' => 'admin',
            'employee_id' => 'ADM001',
            'email' => 'admin@vms.com',
            'user_type' => 'admin',
            'department_id' => 3, // Administration department
            'official_phone' => '+8801711000001',
            'personal_phone' => '+8801855000001',
            'emergency_phone' => '+8801999000001',
            'emergency_contact_name' => 'Admin Emergency Contact',
            'emergency_contact_relation' => 'Family',
            'present_address' => 'Admin Residence, Dhaka',
            'permanent_address' => 'Admin Permanent Address, Dhaka',
            'joining_date' => '2020-01-01',
            'status' => 'active',
            'blood_group' => 'O+',
            'password' => Hash::make('password'),
        ]);

        // Create Transport Manager
        $transportManager = User::create([
            'name' => 'Sarah Transport Manager',
            'username' => 'sarah.manager',
            'employee_id' => 'TM001',
            'email' => 'transport.manager@vms.com',
            'user_type' => 'transport_manager',
            'department_id' => 1, // Transport department
            'official_phone' => '+8801711000002',
            'personal_phone' => '+8801855000002',
            'emergency_phone' => '+8801999000002',
            'emergency_contact_name' => 'Manager Emergency Contact',
            'emergency_contact_relation' => 'Spouse',
            'driving_license_no' => 'DL-TM-001',
            'license_class' => 'B',
            'license_issue_date' => '2018-03-15',
            'license_expiry_date' => '2026-03-15',
            'driver_status' => 'available',
            'present_address' => 'Transport Manager Residence, Chittagong',
            'permanent_address' => 'Transport Manager Permanent, Chittagong',
            'joining_date' => '2021-02-15',
            'blood_group' => 'A+',
            'total_distance_covered' => 25000.75,
            'total_trips_completed' => 200,
            'average_rating' => 4.8,
            'status' => 'active',
            'password' => Hash::make('password'),
        ]);

        // Create Senior Drivers
        $seniorDrivers = [
            [
                'name' => 'Ahmed Senior Driver',
                'username' => 'ahmed.driver',
                'employee_id' => 'DRV001',
                'email' => 'ahmed.driver@vms.com',
                'license_no' => 'DL-DRV-001',
                'phone_suffix' => '003',
                'blood_group' => 'B+',
                'address' => 'Senior Driver Area, Dhaka'
            ],
            [
                'name' => 'Karim Senior Driver',
                'username' => 'karim.driver',
                'employee_id' => 'DRV002',
                'email' => 'karim.driver@vms.com',
                'license_no' => 'DL-DRV-002',
                'phone_suffix' => '004',
                'blood_group' => 'AB+',
                'address' => 'Senior Driver Area, Sylhet'
            ]
        ];

        foreach ($seniorDrivers as $driverData) {
            User::create([
                'name' => $driverData['name'],
                'username' => $driverData['username'],
                'employee_id' => $driverData['employee_id'],
                'email' => $driverData['email'],
                'user_type' => 'driver',
                'department_id' => 1, // Transport department
                'official_phone' => '+880171100000' . $driverData['phone_suffix'],
                'personal_phone' => '+880185500000' . $driverData['phone_suffix'],
                'emergency_phone' => '+880199900000' . $driverData['phone_suffix'],
                'emergency_contact_name' => $driverData['name'] . ' Emergency',
                'emergency_contact_relation' => 'Family',
                'driving_license_no' => $driverData['license_no'],
                'license_class' => 'B',
                'license_issue_date' => '2019-06-01',
                'license_expiry_date' => '2027-06-01',
                'driver_status' => 'available',
                'present_address' => $driverData['address'],
                'permanent_address' => $driverData['address'] . ' (Permanent)',
                'joining_date' => '2022-03-01',
                'blood_group' => $driverData['blood_group'],
                'total_distance_covered' => rand(15000, 30000),
                'total_trips_completed' => rand(150, 300),
                'average_rating' => round(rand(40, 50) / 10, 1),
                'status' => 'active',
                'password' => Hash::make('password'),
            ]);
        }

        // Create Regular Drivers
        $regularDrivers = [
            [
                'name' => 'Rahim Regular Driver',
                'username' => 'rahim.driver',
                'employee_id' => 'DRV003',
                'email' => 'rahim.driver@vms.com',
                'license_no' => 'DL-DRV-003',
                'phone_suffix' => '005',
                'blood_group' => 'O-',
                'address' => 'Driver Colony, Dhaka'
            ],
            [
                'name' => 'Hasan Regular Driver',
                'username' => 'hasan.driver',
                'employee_id' => 'DRV004',
                'email' => 'hasan.driver@vms.com',
                'license_no' => 'DL-DRV-004',
                'phone_suffix' => '006',
                'blood_group' => 'A-',
                'address' => 'Driver Area, Chittagong'
            ]
        ];

        foreach ($regularDrivers as $driverData) {
            User::create([
                'name' => $driverData['name'],
                'username' => $driverData['username'],
                'employee_id' => $driverData['employee_id'],
                'email' => $driverData['email'],
                'user_type' => 'driver',
                'department_id' => 1, // Transport department
                'official_phone' => '+880171100000' . $driverData['phone_suffix'],
                'personal_phone' => '+880185500000' . $driverData['phone_suffix'],
                'emergency_phone' => '+880199900000' . $driverData['phone_suffix'],
                'emergency_contact_name' => $driverData['name'] . ' Emergency',
                'emergency_contact_relation' => 'Family',
                'driving_license_no' => $driverData['license_no'],
                'license_class' => 'B',
                'license_issue_date' => '2020-08-15',
                'license_expiry_date' => '2028-08-15',
                'driver_status' => 'available',
                'present_address' => $driverData['address'],
                'permanent_address' => $driverData['address'] . ' (Permanent)',
                'joining_date' => '2023-01-15',
                'blood_group' => $driverData['blood_group'],
                'total_distance_covered' => rand(8000, 15000),
                'total_trips_completed' => rand(80, 150),
                'average_rating' => round(rand(35, 45) / 10, 1),
                'status' => 'active',
                'password' => Hash::make('password'),
            ]);
        }

        // Create Employees from different departments
        $employees = [
            [
                'name' => 'John HR Employee',
                'username' => 'john.hr',
                'employee_id' => 'HR001',
                'email' => 'john.hr@vms.com',
                'department_id' => 2, // HR department
                'phone_suffix' => '007',
                'address' => 'HR Staff Quarters, Dhaka'
            ],
            [
                'name' => 'Lisa Finance Employee',
                'username' => 'lisa.finance',
                'employee_id' => 'FIN001',
                'email' => 'lisa.finance@vms.com',
                'department_id' => 5, // Finance department
                'phone_suffix' => '008',
                'address' => 'Finance Staff Area, Dhaka'
            ],
            [
                'name' => 'David Operations Employee',
                'username' => 'david.operations',
                'employee_id' => 'OPS001',
                'email' => 'david.operations@vms.com',
                'department_id' => 4, // Operations department
                'phone_suffix' => '009',
                'address' => 'Operations Staff Area, Chittagong'
            ],
            [
                'name' => 'Maria Admin Employee',
                'username' => 'maria.admin',
                'employee_id' => 'ADM002',
                'email' => 'maria.admin@vms.com',
                'department_id' => 3, // Administration department
                'phone_suffix' => '010',
                'address' => 'Admin Staff Area, Sylhet'
            ]
        ];

        foreach ($employees as $empData) {
            User::create([
                'name' => $empData['name'],
                'username' => $empData['username'],
                'employee_id' => $empData['employee_id'],
                'email' => $empData['email'],
                'user_type' => 'employee',
                'department_id' => $empData['department_id'],
                'official_phone' => '+880171100000' . $empData['phone_suffix'],
                'personal_phone' => '+880185500000' . $empData['phone_suffix'],
                'emergency_phone' => '+880199900000' . $empData['phone_suffix'],
                'emergency_contact_name' => $empData['name'] . ' Emergency',
                'emergency_contact_relation' => 'Family',
                'present_address' => $empData['address'],
                'permanent_address' => $empData['address'] . ' (Permanent)',
                'joining_date' => '2023-' . str_pad(rand(1, 12), 2, '0', STR_PAD_LEFT) . '-' . str_pad(rand(1, 28), 2, '0', STR_PAD_LEFT),
                'blood_group' => ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'][rand(0, 7)],
                'status' => 'active',
                'password' => Hash::make('password'),
            ]);
        }

        // Assign Spatie Roles (if roles exist)
        try {
            if (Role::where('name', 'super-admin')->exists()) {
                $admin->assignRole('super-admin');
            }

            if (Role::where('name', 'transport-manager')->exists()) {
                $transportManager->assignRole('transport-manager');
            }

            if (Role::where('name', 'driver')->exists()) {
                $drivers = User::where('user_type', 'driver')->get();
                foreach ($drivers as $driver) {
                    $driver->assignRole('driver');
                }
            }

            if (Role::where('name', 'employee')->exists()) {
                $employees = User::where('user_type', 'employee')->get();
                foreach ($employees as $employee) {
                    $employee->assignRole('employee');
                }
            }
        } catch (\Exception $e) {
            // Roles might not exist yet, continue without assigning
        }

        echo "VMS Users created successfully:\n";
        echo "- 1 Admin (admin/password)\n";
        echo "- 1 Transport Manager (sarah.manager/password)\n";
        echo "- 4 Drivers (ahmed.driver, karim.driver, rahim.driver, hasan.driver/password)\n";
        echo "- 4 Employees from different departments (john.hr, lisa.finance, david.operations, maria.admin/password)\n";
    }
}
