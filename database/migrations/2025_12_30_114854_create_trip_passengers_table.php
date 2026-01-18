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
        Schema::create('trip_passengers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained('trips')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Stop selection (which stop on route they board/exit)
            $table->foreignId('pickup_stop_id')->nullable()->constrained('stops')->onDelete('set null');
            $table->foreignId('dropoff_stop_id')->nullable()->constrained('stops')->onDelete('set null');

            // Passenger status tracking
            $table->enum('status', [
                'pending',    // Added to trip, not confirmed
                'confirmed',  // Passenger confirmed attendance
                'boarded',    // Passenger checked in/boarded
                'completed',  // Passenger dropped off
                'cancelled',  // Passenger cancelled
                'no_show'     // Passenger didn't show up
            ])->default('pending');

            // Timing
            $table->dateTime('boarded_at')->nullable();
            $table->dateTime('dropped_at')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['trip_id', 'status']);
            $table->index(['user_id', 'status']);
            $table->unique(['trip_id', 'user_id'], 'trip_user_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trip_passengers');
    }
};
