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
        Schema::create('trip_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained()->onDelete('cascade');
            $table->foreignId('stop_id')->constrained()->onDelete('cascade');
            $table->foreignId('factory_id')->nullable()->constrained('factories')->onDelete('set null');
            $table->integer('stop_order')->default(1);
            $table->timestamp('estimated_arrival')->nullable();
            $table->timestamp('actual_arrival')->nullable();
            $table->timestamp('departure_time')->nullable();
            $table->boolean('is_destination')->default(false);
            $table->string('visit_purpose')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['trip_id', 'stop_id']);
            $table->index(['trip_id', 'stop_order']);
            $table->index(['trip_id', 'is_destination']);
            $table->index('factory_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trip_stops');
    }
};
