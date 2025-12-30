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
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->string('trip_number')->unique();
            
            // Trip participants
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->onDelete('set null');
            $table->foreignId('driver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            
            // Trip details
            $table->string('purpose');
            $table->text('description')->nullable();
            $table->enum('trip_type', ['official', 'emergency', 'maintenance', 'transport'])->default('official');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            
            // Route information
            $table->string('start_location');
            $table->decimal('start_latitude', 10, 8)->nullable();
            $table->decimal('start_longitude', 11, 8)->nullable();
            $table->string('end_location');
            $table->decimal('end_latitude', 10, 8)->nullable();
            $table->decimal('end_longitude', 11, 8)->nullable();
            $table->json('via_points')->nullable();
            $table->decimal('estimated_distance', 8, 2)->nullable();
            $table->integer('estimated_duration')->nullable(); // in minutes
            
            // Schedule
            $table->dateTime('scheduled_start');
            $table->dateTime('scheduled_end');
            $table->dateTime('actual_start')->nullable();
            $table->dateTime('actual_end')->nullable();
            
            // Passengers
            $table->integer('passenger_count')->default(1);
            $table->json('passenger_list')->nullable();
            
            // Trip status and tracking
            $table->enum('status', ['pending', 'approved', 'rejected', 'assigned', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->decimal('actual_distance', 8, 2)->nullable();
            $table->integer('actual_duration')->nullable(); // in minutes
            $table->decimal('fuel_consumed', 8, 2)->nullable();
            $table->decimal('trip_cost', 10, 2)->nullable();
            
            // Ratings and feedback
            $table->integer('driver_rating')->nullable();
            $table->integer('vehicle_rating')->nullable();
            $table->text('feedback')->nullable();
            $table->text('rejection_reason')->nullable();
            
            // Additional fields
            $table->text('notes')->nullable();
            $table->json('trip_documents')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('status');
            $table->index('scheduled_start');
            $table->index(['vehicle_id', 'status']);
            $table->index(['driver_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};
