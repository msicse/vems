<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    // You can add custom methods here if needed
    
    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'id';
    }
    
    /**
     * Get formatted created date
     */
    public function getFormattedCreatedAtAttribute(): string
    {
        return $this->created_at->format('M d, Y');
    }
    
    /**
     * Get users count for this role
     */
    public function getUsersCountAttribute(): int
    {
        return $this->users()->count();
    }
    
    /**
     * Get permissions count for this role
     */
    public function getPermissionsCountAttribute(): int
    {
        return $this->permissions()->count();
    }
}
