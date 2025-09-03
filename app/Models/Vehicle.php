<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;
    protected $fillable = [
        'brand',
        'model',
        'color',
        'registration_number',
        'vendor', // Keep for backward compatibility during migration
        'vendor_id',
        'driver_id',
        'is_active',
        // Tax Token
        'tax_token_last_date',
        'tax_token_number',
        // Fitness Certificate
        'fitness_certificate_last_date',
        'fitness_certificate_number',
        // Insurance
        'insurance_type',
        'insurance_last_date',
        'insurance_policy_number',
        'insurance_company',
        // Registration Certificate & Owner Info
        'registration_certificate_number',
        'owner_name',
        'owner_address',
        'owner_phone',
        'owner_email',
        'owner_nid',
        // Additional Vehicle Info
        'manufacture_year',
        'engine_number',
        'chassis_number',
        'fuel_type',
        // Alert Settings
        'tax_token_alert_enabled',
        'fitness_alert_enabled',
        'insurance_alert_enabled',
        'alert_days_before',
    ];

    protected $casts = [
        'tax_token_last_date' => 'date',
        'fitness_certificate_last_date' => 'date',
        'insurance_last_date' => 'date',
        'is_active' => 'boolean',
        'tax_token_alert_enabled' => 'boolean',
        'fitness_alert_enabled' => 'boolean',
        'insurance_alert_enabled' => 'boolean',
        'manufacture_year' => 'integer',
        'alert_days_before' => 'integer',
    ];

    /**
     * Get the vendor that owns this vehicle
     */
    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * Get the driver assigned to this vehicle
     */
    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    /**
     * Check if tax token is expired or expiring soon
     */
    public function isTaxTokenExpiring(): bool
    {
        if (!$this->tax_token_last_date || !$this->tax_token_alert_enabled) {
            return false;
        }

        return $this->tax_token_last_date->diffInDays(now(), false) <= $this->alert_days_before;
    }

    /**
     * Check if fitness certificate is expired or expiring soon
     */
    public function isFitnessExpiring(): bool
    {
        if (!$this->fitness_certificate_last_date || !$this->fitness_alert_enabled) {
            return false;
        }

        return $this->fitness_certificate_last_date->diffInDays(now(), false) <= $this->alert_days_before;
    }

    /**
     * Check if insurance is expired or expiring soon
     */
    public function isInsuranceExpiring(): bool
    {
        if (!$this->insurance_last_date || !$this->insurance_alert_enabled) {
            return false;
        }

        return $this->insurance_last_date->diffInDays(now(), false) <= $this->alert_days_before;
    }

    /**
     * Get all expiring documents
     */
    public function getExpiringDocuments(): array
    {
        $expiring = [];

        if ($this->isTaxTokenExpiring()) {
            $expiring[] = [
                'type' => 'tax_token',
                'name' => 'Tax Token',
                'date' => $this->tax_token_last_date,
                'days_left' => $this->tax_token_last_date ? $this->tax_token_last_date->diffInDays(now(), false) : null
            ];
        }

        if ($this->isFitnessExpiring()) {
            $expiring[] = [
                'type' => 'fitness',
                'name' => 'Fitness Certificate',
                'date' => $this->fitness_certificate_last_date,
                'days_left' => $this->fitness_certificate_last_date ? $this->fitness_certificate_last_date->diffInDays(now(), false) : null
            ];
        }

        if ($this->isInsuranceExpiring()) {
            $expiring[] = [
                'type' => 'insurance',
                'name' => 'Insurance',
                'date' => $this->insurance_last_date,
                'days_left' => $this->insurance_last_date ? $this->insurance_last_date->diffInDays(now(), false) : null
            ];
        }

        return $expiring;
    }

    /**
     * Scope to get vehicles with expiring documents
     */
    public function scopeWithExpiringDocuments($query)
    {
        return $query->where(function ($q) {
            $q->where(function ($subQ) {
                $subQ->where('tax_token_alert_enabled', true)
                    ->whereNotNull('tax_token_last_date')
                    ->whereRaw('DATEDIFF(tax_token_last_date, NOW()) <= alert_days_before');
            })
            ->orWhere(function ($subQ) {
                $subQ->where('fitness_alert_enabled', true)
                    ->whereNotNull('fitness_certificate_last_date')
                    ->whereRaw('DATEDIFF(fitness_certificate_last_date, NOW()) <= alert_days_before');
            })
            ->orWhere(function ($subQ) {
                $subQ->where('insurance_alert_enabled', true)
                    ->whereNotNull('insurance_last_date')
                    ->whereRaw('DATEDIFF(insurance_last_date, NOW()) <= alert_days_before');
            });
        });
    }
}
