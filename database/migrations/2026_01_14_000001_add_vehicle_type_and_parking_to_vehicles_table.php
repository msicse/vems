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
        Schema::table('vehicles', function (Blueprint $table) {
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
            ])->default('sedan')->after('registration_number');

            // Rental Type (adhoc, pool, own)
            $table->enum('rental_type', [
                'own',      // Company owned
                'pool',     // Pool/shared vehicle
                'rental',   // Leased vehicle
                'adhoc',    // Ad-hoc rental
                'support',  // Support vehicle
            ])->default('pool')->after('vehicle_type');

            // Vehicle Status
            $table->enum('status', [
                'available',
                'assigned',
                'in_transit',
                'maintenance',
                'out_of_service',
            ])->default('available')->after('is_active');

            // Parking Location with Geo-coordinates
            $table->text('parking_address')->nullable()->after('alert_days_before');
            $table->decimal('parking_latitude', 10, 8)->nullable()->after('parking_address');
            $table->decimal('parking_longitude', 11, 8)->nullable()->after('parking_latitude');
            $table->integer('capacity')->nullable()->after('rental_type');

            // Add index for better query performance
            $table->index('vehicle_type');
            $table->index('rental_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropIndex(['vehicle_type']);
            $table->dropIndex(['rental_type']);
            $table->dropColumn([
                'vehicle_type',
                'rental_type',
                'capacity',
                'parking_address',
                'parking_latitude',
                'parking_longitude'
            ]);
        });
    }
};
