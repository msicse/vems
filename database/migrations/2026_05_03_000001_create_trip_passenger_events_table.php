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
        Schema::create('trip_passenger_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_passenger_id')->constrained('trip_passengers')->onDelete('cascade');
            $table->foreignId('trip_id')->constrained('trips')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('event_type', ['check_in', 'check_out', 'no_show', 'manual_override', 'correction']);
            $table->dateTime('event_time');
            $table->foreignId('stop_id')->nullable()->constrained('stops')->nullOnDelete();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('gps_accuracy_meters', 8, 2)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('area_name')->nullable();
            $table->string('source', 50)->nullable();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('device_id')->nullable();
            $table->string('idempotency_key')->nullable()->unique();
            $table->boolean('is_valid')->default(true);
            $table->timestamp('voided_at')->nullable();
            $table->text('void_reason')->nullable();
            $table->foreignId('superseded_by_event_id')->nullable()->constrained('trip_passenger_events')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['trip_passenger_id', 'event_time']);
            $table->index(['trip_id', 'user_id', 'event_type']);
            $table->index(['event_type', 'event_time']);
            $table->index(['is_valid', 'event_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trip_passenger_events');
    }
};
