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
        Schema::table('vehicles', function (Blueprint $table) {
            // Tax Token Information
            $table->date('tax_token_last_date')->nullable()->after('vendor');
            $table->string('tax_token_number')->nullable()->after('tax_token_last_date');

            // Fitness Certificate Information?
            $table->date('fitness_certificate_last_date')->nullable()->after('tax_token_number');
            $table->string('fitness_certificate_number')->nullable()->after('fitness_certificate_last_date');

            // Insurance Information
            $table->enum('insurance_type', ['1st_party', '3rd_party', 'comprehensive'])->nullable()->after('fitness_certificate_number');
            $table->date('insurance_last_date')->nullable()->after('insurance_type');
            $table->string('insurance_policy_number')->nullable()->after('insurance_last_date');
            $table->string('insurance_company')->nullable()->after('insurance_policy_number');

            // Vehicle Registration Certificate & Owner Information
            $table->string('registration_certificate_number')->nullable()->after('insurance_company');
            $table->string('owner_name')->nullable()->after('registration_certificate_number');
            $table->text('owner_address')->nullable()->after('owner_name');
            $table->string('owner_phone')->nullable()->after('owner_address');
            $table->string('owner_email')->nullable()->after('owner_phone');
            $table->string('owner_nid')->nullable()->after('owner_email'); // National ID

            // Additional useful fields
            $table->year('manufacture_year')->nullable()->after('owner_nid');
            $table->string('engine_number')->nullable()->after('manufacture_year');
            $table->string('chassis_number')->nullable()->after('engine_number');
            $table->enum('fuel_type', ['petrol', 'diesel', 'cng', 'electric', 'hybrid'])->nullable()->after('chassis_number');

            // Document expiry alerts
            $table->boolean('tax_token_alert_enabled')->default(true)->after('fuel_type');
            $table->boolean('fitness_alert_enabled')->default(true)->after('tax_token_alert_enabled');
            $table->boolean('insurance_alert_enabled')->default(true)->after('fitness_alert_enabled');

            // Alert days before expiry
            $table->integer('alert_days_before')->default(30)->after('insurance_alert_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn([
                'tax_token_last_date',
                'tax_token_number',
                'fitness_certificate_last_date',
                'fitness_certificate_number',
                'insurance_type',
                'insurance_last_date',
                'insurance_policy_number',
                'insurance_company',
                'registration_certificate_number',
                'owner_name',
                'owner_address',
                'owner_phone',
                'owner_email',
                'owner_nid',
                'manufacture_year',
                'engine_number',
                'chassis_number',
                'fuel_type',
                'tax_token_alert_enabled',
                'fitness_alert_enabled',
                'insurance_alert_enabled',
                'alert_days_before',
            ]);
        });
    }
};
