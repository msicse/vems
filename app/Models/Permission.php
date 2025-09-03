<?php

namespace App\Models;

use Spatie\Permission\Models\Permission as SpatiePermission;

class Permission extends SpatiePermission
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
     * Get roles count for this permission
     */
    public function getRolesCountAttribute(): int
    {
        return $this->roles()->count();
    }
    
    /**
     * Get users count for this permission
     */
    public function getUsersCountAttribute(): int
    {
        return $this->users()->count();
    }
}
