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

            // Core relationships
            $table->foreignId('vehicle_route_id')->nullable()->constrained('vehicle_routes')->onDelete('set null');
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->onDelete('set null');
            $table->foreignId('driver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');

            // Trip details
            $table->text('description')->nullable();

            // Trip type with predefined options
            $table->enum('trip_type', [
                'inspection',
                'pick-up',
                'drop-off',
                'training',
                'complaints',
                'CVV',
                'Incident Inspection',
                'officials',
                'Assigned'
            ])->nullable();

            $table->string('team_number')->nullable();
            $table->text('remarks')->nullable();

            $table->enum('schedule_type', ['pick-and-drop', 'engineer', 'training', 'adhoc', 'reposition'])->default('adhoc');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');

            // Dynamic start and end locations
            $table->string('start_location')->nullable();
            $table->string('end_location')->nullable();

            // Schedule
            $table->date('scheduled_date');
            $table->time('scheduled_start_time');
            $table->time('scheduled_end_time');
            $table->dateTime('actual_start_time')->nullable();
            $table->dateTime('actual_end_time')->nullable();

            // Actual trip times (different from scheduled times)
            $table->timestamp('start_time')->nullable();
            $table->timestamp('end_time')->nullable();

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
                'pending',
                'approved',
                'rejected',
                'assigned',
                'in_progress',
                'completed',
                'cancelled'
            ])->default('pending');

            // Cancellation fields
            $table->enum('cancellation_reason', [
                'passenger_no_show',
                'vehicle_breakdown',
                'driver_unavailable',
                'route_blocked',
                'weather_conditions',
                'emergency',
                'other'
            ])->nullable();
            $table->text('cancellation_notes')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users');
            $table->timestamp('cancelled_at')->nullable();

            // Ratings and feedback
            $table->tinyInteger('driver_rating')->nullable()->comment('1-5 rating');
            $table->tinyInteger('vehicle_rating')->nullable()->comment('1-5 rating');
            $table->text('feedback')->nullable();
            $table->text('rejection_reason')->nullable();

            // Trip flags
            $table->boolean('is_return')->default(false);
            $table->boolean('is_completed')->default(false);

            // Recurring trip support
            $table->boolean('is_recurring')->default(false);
            $table->foreignId('recurring_group_id')->nullable()->constrained('trip_recurring_groups')->onDelete('cascade');
            $table->date('recurring_start_date')->nullable();
            $table->date('recurring_end_date')->nullable();
            $table->foreignId('original_trip_id')->nullable()->constrained('trips')->onDelete('set null');

            // Multiple departments (JSON array of department IDs)
            $table->json('multiple_departments')->nullable();

            // Comments and notes
            $table->text('comments')->nullable();
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
            $table->index('is_recurring');
            $table->index('recurring_group_id');
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
