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
        Schema::create('trip_recurring_groups', function (Blueprint $table) {
            $table->id();
            $table->string('group_name')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('total_trips')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('created_by');
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trip_recurring_groups');
    }
};
