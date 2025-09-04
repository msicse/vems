<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Department extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'head_id',
        'location',
        'phone',
        'email',
        'is_active',
        'budget_allocation',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'budget_allocation' => 'array',
    ];

    /**
     * Get users in this department
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the department head
     */
    public function head(): BelongsTo
    {
        return $this->belongsTo(User::class, 'head_id');
    }

    /**
     * Get drivers in this department
     */
    public function drivers()
    {
        return $this->users()->whereIn('user_type', ['driver', 'transport_manager']);
    }

    /**
     * Scope to get only active departments
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get total budget allocation
     */
    public function getTotalBudgetAttribute()
    {
        if (!$this->budget_allocation) {
            return 0;
        }

        return array_sum($this->budget_allocation);
    }

    /**
     * Get specific budget amount
     */
    public function getBudget($type)
    {
        return $this->budget_allocation[$type] ?? 0;
    }

    /**
     * Update budget allocation
     */
    public function updateBudget($type, $amount)
    {
        $budget = $this->budget_allocation ?? [];
        $budget[$type] = $amount;
        $this->budget_allocation = $budget;
        $this->save();
    }
}
