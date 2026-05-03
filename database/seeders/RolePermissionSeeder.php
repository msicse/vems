<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        $permissions = [
            // Vehicle Management
            'view-vehicles',
            'create-vehicles',
            'edit-vehicles',
            'delete-vehicles',
            'assign-vehicles',
            'manage-vehicle-documents',

            // Trip Management
            'view-trips',
            'create-trips',
            'edit-trips',
            'delete-trips',
            'approve-trips',
            'reject-trips',
            'assign-drivers',
            'check-in-trips',
            'check-out-trips',

            // Trip Passenger Attendance
            'capture-passenger-attendance',
            'correct-passenger-attendance',
            'view-passenger-events',

            // Driver Management
            'view-drivers',
            'create-drivers',
            'edit-drivers',
            'delete-drivers',
            'manage-driver-documents',
            'view-driver-performance',

            // Scheduling
            'view-schedules',
            'create-schedules',
            'edit-schedules',
            'delete-schedules',
            'manage-recurring-schedules',

            // Maintenance
            'view-maintenance',
            'create-maintenance',
            'edit-maintenance',
            'delete-maintenance',
            'schedule-maintenance',
            'approve-maintenance',

            // Fuel Management
            'view-fuel-logs',
            'create-fuel-logs',
            'edit-fuel-logs',
            'delete-fuel-logs',
            'manage-fuel-budget',

            // Reports & Analytics
            'view-reports',
            'create-reports',
            'export-reports',
            'view-analytics',
            'view-cost-analysis',

            // Department Management
            'view-departments',
            'create-departments',
            'edit-departments',
            'delete-departments',
            'manage-department-budget',

            // User Management
            'view-users',
            'create-users',
            'edit-users',
            'delete-users',
            'manage-user-roles',
            'view-user-activity',

            // System Settings
            'view-settings',
            'edit-settings',
            'manage-system-config',
            'view-system-logs',
            'backup-system',

            // Notifications
            'view-notifications',
            'send-notifications',
            'manage-notification-settings',

            // GPS Tracking (Optional)
            'view-live-tracking',
            'manage-tracking-settings',
            'view-route-history',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create Roles and Assign Permissions

        // 1. Super Admin - Full Access
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        // 2. Transport Manager - Fleet Management
        $transportManager = Role::firstOrCreate(['name' => 'transport-manager', 'guard_name' => 'web']);
        $transportManager->syncPermissions([
            // Vehicle Management
            'view-vehicles', 'create-vehicles', 'edit-vehicles', 'delete-vehicles',
            'assign-vehicles', 'manage-vehicle-documents',

            // Trip Management
            'view-trips', 'create-trips', 'edit-trips', 'approve-trips', 'reject-trips',
            'assign-drivers', 'check-in-trips', 'check-out-trips',
            'capture-passenger-attendance', 'correct-passenger-attendance', 'view-passenger-events',

            // Driver Management
            'view-drivers', 'create-drivers', 'edit-drivers', 'manage-driver-documents',
            'view-driver-performance',

            // Scheduling
            'view-schedules', 'create-schedules', 'edit-schedules', 'delete-schedules',
            'manage-recurring-schedules',

            // Maintenance
            'view-maintenance', 'create-maintenance', 'edit-maintenance', 'schedule-maintenance',
            'approve-maintenance',

            // Fuel Management
            'view-fuel-logs', 'create-fuel-logs', 'edit-fuel-logs', 'manage-fuel-budget',

            // Reports
            'view-reports', 'create-reports', 'export-reports', 'view-analytics', 'view-cost-analysis',

            // GPS Tracking
            'view-live-tracking', 'manage-tracking-settings', 'view-route-history',

            // Notifications
            'view-notifications', 'send-notifications', 'manage-notification-settings',
        ]);

        // 3. Assistant Transport Manager - Limited Management
        $assistantTransportManager = Role::firstOrCreate(['name' => 'assistant-transport-manager', 'guard_name' => 'web']);
        $assistantTransportManager->syncPermissions([
            'view-vehicles', 'edit-vehicles', 'assign-vehicles',
            'view-trips', 'create-trips', 'edit-trips', 'approve-trips', 'assign-drivers',
            'capture-passenger-attendance', 'view-passenger-events',
            'view-drivers', 'edit-drivers', 'view-driver-performance',
            'view-schedules', 'create-schedules', 'edit-schedules',
            'view-maintenance', 'create-maintenance', 'schedule-maintenance',
            'view-fuel-logs', 'create-fuel-logs',
            'view-reports', 'view-analytics',
            'view-live-tracking', 'view-route-history',
            'view-notifications',
        ]);

        // 4. Department Head - Department-specific Approval
        $departmentHead = Role::firstOrCreate(['name' => 'department-head', 'guard_name' => 'web']);
        $departmentHead->syncPermissions([
            'view-vehicles', 'view-trips', 'create-trips', 'approve-trips',
            'view-drivers', 'view-schedules', 'view-reports',
            'view-notifications', 'manage-department-budget',
        ]);

        // 5. Transport Officer - Operations
        $transportOfficer = Role::firstOrCreate(['name' => 'transport-officer', 'guard_name' => 'web']);
        $transportOfficer->syncPermissions([
            'view-vehicles', 'edit-vehicles', 'assign-vehicles',
            'view-trips', 'create-trips', 'edit-trips', 'assign-drivers',
            'check-in-trips', 'check-out-trips',
            'capture-passenger-attendance', 'view-passenger-events',
            'view-drivers', 'edit-drivers',
            'view-schedules', 'create-schedules', 'edit-schedules',
            'view-maintenance', 'create-maintenance',
            'view-fuel-logs', 'create-fuel-logs', 'edit-fuel-logs',
            'view-reports',
            'view-live-tracking', 'view-route-history',
            'view-notifications',
        ]);

        // 6. Admin Officer - Documentation & Admin
        $adminOfficer = Role::firstOrCreate(['name' => 'admin-officer', 'guard_name' => 'web']);
        $adminOfficer->syncPermissions([
            'view-vehicles', 'manage-vehicle-documents',
            'view-trips', 'create-trips',
            'view-drivers', 'manage-driver-documents',
            'view-schedules', 'view-maintenance',
            'view-fuel-logs', 'view-reports',
            'view-departments', 'view-users',
            'view-notifications',
        ]);

        // 7. Senior Driver - Advanced Driver Privileges
        $seniorDriver = Role::firstOrCreate(['name' => 'senior-driver', 'guard_name' => 'web']);
        $seniorDriver->syncPermissions([
            'view-vehicles', 'view-trips', 'check-in-trips', 'check-out-trips',
            'capture-passenger-attendance', 'view-passenger-events',
            'view-drivers', 'view-schedules',
            'view-fuel-logs', 'create-fuel-logs',
            'view-notifications',
        ]);

        // 8. Driver - Basic Driver Access
        $driver = Role::firstOrCreate(['name' => 'driver', 'guard_name' => 'web']);
        $driver->syncPermissions([
            'view-trips', 'check-in-trips', 'check-out-trips',
            'capture-passenger-attendance', 'view-passenger-events',
            'view-schedules', 'view-fuel-logs', 'create-fuel-logs',
            'view-notifications',
        ]);

        // 9. Junior Driver - Limited Access
        $juniorDriver = Role::firstOrCreate(['name' => 'junior-driver', 'guard_name' => 'web']);
        $juniorDriver->syncPermissions([
            'view-trips', 'check-in-trips', 'check-out-trips',
            'capture-passenger-attendance', 'view-passenger-events',
            'view-schedules', 'view-notifications',
        ]);

        // 10. Senior Executive - Priority Access
        $seniorExecutive = Role::firstOrCreate(['name' => 'senior-executive', 'guard_name' => 'web']);
        $seniorExecutive->syncPermissions([
            'view-vehicles', 'view-trips', 'create-trips',
            'view-schedules', 'view-reports',
            'view-notifications',
        ]);

        // 11. Executive - Basic Employee Access
        $executive = Role::firstOrCreate(['name' => 'executive', 'guard_name' => 'web']);
        $executive->syncPermissions([
            'view-trips', 'create-trips', 'view-schedules',
            'view-notifications',
        ]);
    }
}
