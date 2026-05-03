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
            $table->foreignId('pickup_stop_id')->nullable()->constrained('stops')->onDelete('set null');
            $table->foreignId('dropoff_stop_id')->nullable()->constrained('stops')->onDelete('set null');

            $table->enum('status', [
                'pending',
                'confirmed',
                'boarded',
                'completed',
                'cancelled',
                'no_show'
            ])->default('pending');

            $table->dateTime('boarded_at')->nullable();
            $table->dateTime('dropped_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

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
