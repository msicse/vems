<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('brand');
            $table->string('model');
            $table->string('color')->nullable();
            $table->string('registration_number')->unique();

            // Vehicle Type (sedan, van, coaster, etc.)
            $table->enum('vehicle_type', [
                'sedan',
                'suv',
                'van',
                'microbus',
                'coaster',
                'bus',
                'pickup',
                'truck',
                'other'
            ])->default('sedan');

            // Rental Type (adhoc, pool, own)
            $table->enum('rental_type', [
                'own',      // Company owned
                'pool',     // Pool/shared vehicle
                'rental',   // Leased vehicle
                'adhoc',    // Ad-hoc rental
                'support',  // Support vehicle
            ])->default('pool');

            $table->integer('capacity')->nullable();

            // Relationships
            $table->foreignId('vendor_id')->nullable()->constrained('vendors')->onDelete('set null');
            $table->foreignId('driver_id')->nullable()->constrained('users')->onDelete('set null');

            // Tax Token Information
            $table->date('tax_token_last_date')->nullable();
            $table->string('tax_token_number')->nullable();

            // Fitness Certificate Information
            $table->date('fitness_certificate_last_date')->nullable();
            $table->string('fitness_certificate_number')->nullable();

            // Insurance Information
            $table->enum('insurance_type', ['1st_party', '3rd_party', 'comprehensive'])->nullable();
            $table->date('insurance_last_date')->nullable();
            $table->string('insurance_policy_number')->nullable();
            $table->string('insurance_company')->nullable();

            // Vehicle Registration Certificate & Owner Information
            $table->string('registration_certificate_number')->nullable();
            $table->string('owner_name')->nullable();
            $table->text('owner_address')->nullable();
            $table->string('owner_phone')->nullable();
            $table->string('owner_email')->nullable();
            $table->string('owner_nid')->nullable();

            // Vehicle Specifications
            $table->year('manufacture_year')->nullable();
            $table->string('engine_number')->nullable();
            $table->string('chassis_number')->nullable();
            $table->enum('fuel_type', ['petrol', 'diesel', 'cng', 'electric', 'hybrid'])->nullable();

            // Document expiry alerts
            $table->boolean('tax_token_alert_enabled')->default(true);
            $table->boolean('fitness_alert_enabled')->default(true);
            $table->boolean('insurance_alert_enabled')->default(true);
            $table->integer('alert_days_before')->default(30);

            // Vehicle Status
            $table->enum('status', [
                'available',
                'assigned',
                'in_transit',
                'maintenance',
                'out_of_service',
            ])->default('available');

            // Parking Location with Geo-coordinates
            $table->text('parking_address')->nullable();
            $table->decimal('parking_latitude', 10, 8)->nullable();
            $table->decimal('parking_longitude', 11, 8)->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('status');
            $table->index('vehicle_type');
            $table->index('rental_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
