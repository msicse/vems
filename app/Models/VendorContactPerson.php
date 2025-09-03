<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorContactPerson extends Model
{
    use HasFactory;

    protected $table = 'vendor_contact_persons';

    protected $fillable = [
        'vendor_id',
        'name',
        'position',
        'phone',
        'email',
        'is_primary',
        'notes',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    /**
     * Get the vendor that owns this contact person
     */
    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * Scope to get primary contact persons
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }
}
