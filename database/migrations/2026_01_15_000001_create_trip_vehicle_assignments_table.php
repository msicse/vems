<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('trip_vehicle_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained('trips')->cascadeOnDelete();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('unassigned_at')->nullable();
            $table->boolean('is_current')->default(true);
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reason')->nullable(); // 'initial', 'damaged', 'maintenance', 'breakdown', 'replacement'
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['trip_id', 'is_current']);
            $table->index(['trip_id', 'assigned_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_vehicle_assignments');
    }
};
