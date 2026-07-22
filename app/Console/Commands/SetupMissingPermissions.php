<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class SetupMissingPermissions extends Command
{
    protected $signature = 'setup:missing-permissions';
    protected $description = 'Add missing permissions for factories, logistics, user-groups, and routes';

    public function handle(): void
    {
        $this->info('Adding missing permissions...');

        $newPermissions = [
            // Factory permissions
            'view-factories',
            'create-factories',
            'edit-factories',
            'delete-factories',

            // Logistics permissions
            'view-logistics',
            'create-logistics',
            'edit-logistics',
            'delete-logistics',

            // User group permissions
            'view-user-groups',
            'create-user-groups',
            'edit-user-groups',
            'delete-user-groups',

            // Route permissions
            'view-routes',
            'create-routes',
            'edit-routes',
            'delete-routes',
        ];

        foreach ($newPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
            $this->line("  ✓ {$permission}");
        }

        // Assign to roles (additive — does not remove existing permissions).
        // super-admin isn't listed: Gate::before() short-circuits it regardless of permissions.
        $assignments = [
            'transport-manager' => [
                'view-factories', 'create-factories', 'edit-factories', 'delete-factories',
                'view-logistics', 'create-logistics', 'edit-logistics', 'delete-logistics',
                'view-routes', 'create-routes', 'edit-routes', 'delete-routes',
                'view-user-groups', 'create-user-groups', 'edit-user-groups',
            ],
            'assistant-transport-manager' => [
                'view-factories', 'create-factories', 'edit-factories',
                'view-logistics', 'create-logistics', 'edit-logistics',
                'view-routes', 'create-routes', 'edit-routes',
                'view-user-groups', 'edit-user-groups',
            ],
            'transport-officer' => [
                'view-factories', 'create-factories', 'edit-factories',
                'view-logistics', 'create-logistics', 'edit-logistics',
                'view-routes',
                'view-user-groups',
            ],
            'admin-officer' => [
                'view-factories',
                'view-logistics',
                'view-routes',
                'view-user-groups',
            ],
            'department-head' => [
                'view-factories',
                'view-logistics',
                'view-routes',
                'view-user-groups',
            ],
        ];

        foreach ($assignments as $roleName => $perms) {
            $role = Role::findByName($roleName, 'web');
            if (!$role) {
                $this->warn("  Role not found, skipping: {$roleName}");
                continue;
            }
            // givePermissionTo is additive — safe to call multiple times
            $role->givePermissionTo(
                array_filter($perms, fn($p) => Permission::where('name', $p)->exists())
            );
            $this->info("  Assigned to role: {$roleName}");
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $this->info('Done! Missing permissions added and assigned.');
    }
}
