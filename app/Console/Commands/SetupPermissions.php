<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class SetupPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'setup:permissions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set up basic roles and permissions for the application';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Setting up roles and permissions...');

        // Create permissions
        $permissions = [
            // User permissions
            'view-users',
            'create-users',
            'edit-users',
            'delete-users',

            // Department permissions
            'view-departments',
            'create-departments',
            'edit-departments',
            'delete-departments',

            // Vehicle permissions
            'view-vehicles',
            'create-vehicles',
            'edit-vehicles',
            'delete-vehicles',

            // Product permissions
            'view-products',
            'create-products',
            'edit-products',
            'delete-products',

            // Vendor permissions
            'view-vendors',
            'create-vendors',
            'edit-vendors',
            'delete-vendors',

            // Dashboard and reports
            'view-dashboard',
            'view-reports',
            'export-data',

            // Role and permission management
            'view-roles',
            'create-roles',
            'edit-roles',
            'delete-roles',
            'view-permissions',
            'edit-permissions',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
            $this->info("Permission created: {$permission}");
        }

        // Create roles
        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin']);
        $admin = Role::firstOrCreate(['name' => 'Admin']);
        $manager = Role::firstOrCreate(['name' => 'Manager']);
        $employee = Role::firstOrCreate(['name' => 'Employee']);
        $driver = Role::firstOrCreate(['name' => 'Driver']);

        // Assign all permissions to Super Admin
        $superAdmin->syncPermissions($permissions);

        // Assign most permissions to Admin (except role management)
        $adminPermissions = array_filter($permissions, function($perm) {
            return !str_contains($perm, 'roles') && !str_contains($perm, 'permissions');
        });
        $admin->syncPermissions($adminPermissions);

        // Assign basic permissions to Manager
        $managerPermissions = [
            'view-users', 'edit-users',
            'view-departments', 'edit-departments',
            'view-vehicles', 'edit-vehicles',
            'view-products', 'edit-products',
            'view-vendors', 'edit-vendors',
            'view-dashboard', 'view-reports'
        ];
        $manager->syncPermissions($managerPermissions);

        // Assign view permissions to Employee
        $employeePermissions = [
            'view-departments',
            'view-vehicles',
            'view-products',
            'view-vendors',
            'view-dashboard'
        ];
        $employee->syncPermissions($employeePermissions);

        // Assign minimal permissions to Driver
        $driverPermissions = [
            'view-vehicles',
            'view-dashboard'
        ];
        $driver->syncPermissions($driverPermissions);

        $this->info('Roles created and permissions assigned!');

        // Assign Super Admin role to the first user
        $firstUser = User::first();
        if ($firstUser) {
            $firstUser->assignRole('Super Admin');
            $this->info("Super Admin role assigned to user: {$firstUser->name}");
        }

        $this->info('Permissions setup completed successfully!');
    }
}
