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
            Permission::create(['name' => $permission]);
        }

        // Create Roles and Assign Permissions

        // 1. Super Admin - Full Access
        $superAdmin = Role::create(['name' => 'super-admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // 2. Transport Manager - Fleet Management
        $transportManager = Role::create(['name' => 'transport-manager']);
        $transportManager->givePermissionTo([
            // Vehicle Management
            'view-vehicles', 'create-vehicles', 'edit-vehicles', 'delete-vehicles', 
            'assign-vehicles', 'manage-vehicle-documents',
            
            // Trip Management
            'view-trips', 'create-trips', 'edit-trips', 'approve-trips', 'reject-trips',
            'assign-drivers', 'check-in-trips', 'check-out-trips',
            
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
        $assistantTransportManager = Role::create(['name' => 'assistant-transport-manager']);
        $assistantTransportManager->givePermissionTo([
            'view-vehicles', 'edit-vehicles', 'assign-vehicles',
            'view-trips', 'create-trips', 'edit-trips', 'approve-trips', 'assign-drivers',
            'view-drivers', 'edit-drivers', 'view-driver-performance',
            'view-schedules', 'create-schedules', 'edit-schedules',
            'view-maintenance', 'create-maintenance', 'schedule-maintenance',
            'view-fuel-logs', 'create-fuel-logs',
            'view-reports', 'view-analytics',
            'view-live-tracking', 'view-route-history',
            'view-notifications',
        ]);

        // 4. Department Head - Department-specific Approval
        $departmentHead = Role::create(['name' => 'department-head']);
        $departmentHead->givePermissionTo([
            'view-vehicles', 'view-trips', 'create-trips', 'approve-trips',
            'view-drivers', 'view-schedules', 'view-reports',
            'view-notifications', 'manage-department-budget',
        ]);

        // 5. Transport Officer - Operations
        $transportOfficer = Role::create(['name' => 'transport-officer']);
        $transportOfficer->givePermissionTo([
            'view-vehicles', 'edit-vehicles', 'assign-vehicles',
            'view-trips', 'create-trips', 'edit-trips', 'assign-drivers',
            'check-in-trips', 'check-out-trips',
            'view-drivers', 'edit-drivers',
            'view-schedules', 'create-schedules', 'edit-schedules',
            'view-maintenance', 'create-maintenance',
            'view-fuel-logs', 'create-fuel-logs', 'edit-fuel-logs',
            'view-reports',
            'view-live-tracking', 'view-route-history',
            'view-notifications',
        ]);

        // 6. Admin Officer - Documentation & Admin
        $adminOfficer = Role::create(['name' => 'admin-officer']);
        $adminOfficer->givePermissionTo([
            'view-vehicles', 'manage-vehicle-documents',
            'view-trips', 'create-trips',
            'view-drivers', 'manage-driver-documents',
            'view-schedules', 'view-maintenance',
            'view-fuel-logs', 'view-reports',
            'view-departments', 'view-users',
            'view-notifications',
        ]);

        // 7. Senior Driver - Advanced Driver Privileges
        $seniorDriver = Role::create(['name' => 'senior-driver']);
        $seniorDriver->givePermissionTo([
            'view-vehicles', 'view-trips', 'check-in-trips', 'check-out-trips',
            'view-drivers', 'view-schedules',
            'view-fuel-logs', 'create-fuel-logs',
            'view-notifications',
        ]);

        // 8. Driver - Basic Driver Access
        $driver = Role::create(['name' => 'driver']);
        $driver->givePermissionTo([
            'view-trips', 'check-in-trips', 'check-out-trips',
            'view-schedules', 'view-fuel-logs', 'create-fuel-logs',
            'view-notifications',
        ]);

        // 9. Junior Driver - Limited Access
        $juniorDriver = Role::create(['name' => 'junior-driver']);
        $juniorDriver->givePermissionTo([
            'view-trips', 'check-in-trips', 'check-out-trips',
            'view-schedules', 'view-notifications',
        ]);

        // 10. Senior Executive - Priority Access
        $seniorExecutive = Role::create(['name' => 'senior-executive']);
        $seniorExecutive->givePermissionTo([
            'view-vehicles', 'view-trips', 'create-trips',
            'view-schedules', 'view-reports',
            'view-notifications',
        ]);

        // 11. Executive - Basic Employee Access
        $executive = Role::create(['name' => 'executive']);
        $executive->givePermissionTo([
            'view-trips', 'create-trips', 'view-schedules',
            'view-notifications',
        ]);
    }
}
