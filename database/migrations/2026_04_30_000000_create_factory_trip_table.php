<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('factory_trip', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained('trips')->onDelete('cascade');
            $table->foreignId('factory_id')->constrained('factories')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['trip_id', 'factory_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factory_trip');
    }
};
