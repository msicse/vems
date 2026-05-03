<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('department_trip', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained('trips')->onDelete('cascade');
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');
            $table->unsignedSmallInteger('count')->default(1);
            $table->timestamps();

            $table->unique(['trip_id', 'department_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('department_trip');
    }
};
