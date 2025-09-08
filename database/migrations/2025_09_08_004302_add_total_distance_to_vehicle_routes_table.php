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
        Schema::table('vehicle_routes', function (Blueprint $table) {
            $table->decimal('total_distance', 8, 2)->nullable()->after('remarks'); // Total route distance in kilometers
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_routes', function (Blueprint $table) {
            $table->dropColumn('total_distance');
        });
    }
};
