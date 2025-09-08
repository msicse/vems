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
        Schema::table('route_stops', function (Blueprint $table) {
            $table->decimal('distance_from_previous', 8, 2)->nullable()->after('departure_time'); // Distance in kilometers from previous stop
            $table->decimal('cumulative_distance', 8, 2)->nullable()->after('distance_from_previous'); // Total distance from start of route
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('route_stops', function (Blueprint $table) {
            $table->dropColumn(['distance_from_previous', 'cumulative_distance']);
        });
    }
};
