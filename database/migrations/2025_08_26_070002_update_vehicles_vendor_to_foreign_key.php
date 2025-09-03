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
            // Add the new vendor_id column
            $table->foreignId('vendor_id')->nullable()->after('registration_number')->constrained()->onDelete('set null');
            
            // Keep the old vendor column for now (we'll migrate data and then drop it)
            // $table->string('vendor')->nullable()->change(); // Already nullable
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropForeign(['vendor_id']);
            $table->dropColumn('vendor_id');
        });
    }
};
