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
        Schema::create('trip_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained('trips')->onDelete('cascade');
            $table->foreignId('submitted_by')->constrained('users')->onDelete('cascade');

            $table->enum('type', ['feedback', 'complaint'])->default('feedback');
            $table->enum('category', [
                'driver_behavior',
                'vehicle_condition',
                'punctuality',
                'safety',
                'route',
                'other',
            ])->default('other');

            $table->string('subject');
            $table->text('description');

            $table->unsignedTinyInteger('driver_rating')->nullable();
            $table->unsignedTinyInteger('vehicle_rating')->nullable();

            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('low');
            $table->enum('status', ['open', 'in_review', 'resolved', 'closed'])->default('open');

            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->text('resolution_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');

            $table->boolean('is_anonymous')->default(false);

            $table->timestamps();

            $table->index(['trip_id', 'status']);
            $table->index(['submitted_by', 'status']);
            $table->index(['type', 'status']);
            $table->index(['assigned_to', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trip_feedback');
    }
};
