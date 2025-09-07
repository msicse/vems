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
        Schema::table('vendors', function (Blueprint $table) {
            $table->string('trade_license')->nullable();
            $table->string('trade_license_file')->nullable();
            $table->string('tin')->nullable();
            $table->string('tin_file')->nullable();
            $table->string('bin')->nullable();
            $table->string('bin_file')->nullable();
            $table->string('tax_return')->nullable();
            $table->string('tax_return_file')->nullable();
            $table->text('bank_details')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn('trade_license');
            $table->dropColumn('trade_license_file');
            $table->dropColumn('tin');
            $table->dropColumn('tin_file');
            $table->dropColumn('bin');
            $table->dropColumn('bin_file');
            $table->dropColumn('tax_return');
            $table->dropColumn('tax_return_file');
            $table->dropColumn('bank_details');
        });
    }
};
