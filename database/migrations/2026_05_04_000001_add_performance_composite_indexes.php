<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE users MODIFY user_type VARCHAR(50) NULL, MODIFY status VARCHAR(50) NOT NULL DEFAULT 'active'");
        }

        Schema::table('users', function (Blueprint $table) {
            $table->index(['status', 'user_type'], 'users_status_user_type_idx');
            $table->index(['driver_status', 'status'], 'users_driver_status_status_idx');
            $table->index(['department_id', 'status'], 'users_department_status_idx');
        });

        Schema::table('vehicles', function (Blueprint $table) {
            $table->index(['is_active', 'vendor_id'], 'vehicles_active_vendor_idx');
            $table->index(['is_active', 'driver_id'], 'vehicles_active_driver_idx');
        });

        Schema::table('trips', function (Blueprint $table) {
            $table->index(['status', 'vehicle_id', 'scheduled_date'], 'trips_status_vehicle_date_idx');
            $table->index(['status', 'department_id', 'scheduled_date'], 'trips_status_department_date_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_status_user_type_idx');
            $table->dropIndex('users_driver_status_status_idx');
            $table->dropIndex('users_department_status_idx');
        });

        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropIndex('vehicles_active_vendor_idx');
            $table->dropIndex('vehicles_active_driver_idx');
        });

        Schema::table('trips', function (Blueprint $table) {
            $table->dropIndex('trips_status_vehicle_date_idx');
            $table->dropIndex('trips_status_department_date_idx');
        });

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE users MODIFY user_type VARCHAR(255) NULL, MODIFY status VARCHAR(255) NOT NULL DEFAULT 'active'");
        }
    }
};
