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
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->text('description')->nullable();

            // Document fields
            $table->string('trade_license')->nullable();
            $table->string('trade_license_file')->nullable();
            $table->string('tin')->nullable();
            $table->string('tin_file')->nullable();
            $table->string('bin')->nullable();
            $table->string('bin_file')->nullable();
            $table->string('tax_return')->nullable();
            $table->string('tax_return_file')->nullable();
            $table->text('bank_details')->nullable();

            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
