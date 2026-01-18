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

            // Core relationships (simplified - vehicle already has driver)
            $table->foreignId('vehicle_route_id')->nullable()->constrained('vehicle_routes')->onDelete('set null');
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->onDelete('set null');
            $table->foreignId('driver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');

            // Trip details
            $table->string('purpose');
            $table->text('description')->nullable();
            $table->enum('schedule_type', ['pick-and-drop', 'engineer', 'training', 'adhoc', 'reposition'])->default('adhoc');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');

            // Schedule
            $table->date('scheduled_date');
            $table->time('scheduled_start_time');
            $table->time('scheduled_end_time');
            $table->dateTime('actual_start_time')->nullable();
            $table->dateTime('actual_end_time')->nullable();

            // Odometer tracking for mileage calculation
            $table->decimal('odometer_start', 10, 2)->nullable();
            $table->decimal('odometer_end', 10, 2)->nullable();
            $table->decimal('distance_traveled', 8, 2)->nullable()->storedAs('odometer_end - odometer_start');

            // Trip metrics
            $table->integer('actual_duration')->nullable()->comment('Duration in minutes');
            $table->decimal('fuel_consumed', 8, 2)->nullable();
            $table->decimal('fuel_cost', 10, 2)->nullable();
            $table->decimal('other_costs', 10, 2)->nullable();
            $table->decimal('total_cost', 10, 2)->nullable();

            // Status workflow
            $table->enum('status', [
                'pending',      // Waiting for approval
                'approved',     // Approved by manager
                'rejected',     // Rejected by manager
                'assigned',     // Vehicle/driver assigned
                'in_progress',  // Trip started
                'completed',    // Trip finished
                'cancelled'     // Cancelled by requester
            ])->default('pending');

            // Ratings and feedback
            $table->tinyInteger('driver_rating')->nullable()->comment('1-5 rating');
            $table->tinyInteger('vehicle_rating')->nullable()->comment('1-5 rating');
            $table->text('feedback')->nullable();
            $table->text('rejection_reason')->nullable();

            // Additional fields
            $table->text('notes')->nullable();
            $table->json('trip_documents')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('status');
            $table->index('scheduled_date');
            $table->index(['vehicle_id', 'scheduled_date']);
            $table->index(['driver_id', 'scheduled_date']);
            $table->index(['schedule_type', 'status']);
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
