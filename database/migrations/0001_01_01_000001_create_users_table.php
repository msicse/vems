<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username')->unique();
            $table->string('employee_id')->nullable()->unique();
            $table->string('email')->nullable()->unique();

            // Contact Information
            $table->string('official_phone')->nullable();
            $table->string('personal_phone')->nullable();
             // Fixed field name
            $table->string('whatsapp_id')->nullable();

            // Emergency contacts (Enhanced)
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_relation')->nullable();
            $table->string('emergency_phone')->nullable();

            // Identity Documents
            $table->string('nid_number')->nullable()->unique();
            $table->string('passport_number')->nullable();
            $table->string('driving_license_no')->nullable();
            $table->string('license_class')->nullable(); // A, B, C, D classes
            $table->date('license_issue_date')->nullable();
            $table->date('license_expiry_date')->nullable();

            // User Classification
            $table->string('user_type')->nullable(); // employee, driver, transport_manager, admin
            $table->foreignId('department_id')->nullable()->constrained()->onDelete('set null');
            $table->string('blood_group')->nullable();
            $table->string('image')->nullable(); // Profile photo
            $table->string('status')->default('active');

            // Employment Details
            $table->date('joining_date')->nullable();
            $table->date('probation_end_date')->nullable();

            // Address Information
            $table->string('area')->nullable();
            $table->text('present_address')->nullable();
            $table->text('permanent_address')->nullable();

            // Document Storage Paths
            $table->string('photo')->nullable();

            // Driver Performance & Status (for drivers only)
            $table->decimal('total_distance_covered', 12, 2)->default(0);
            $table->integer('total_trips_completed')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->enum('driver_status', ['available', 'on_trip', 'on_leave', 'inactive', 'suspended'])->nullable();

            // Login Tracking
            $table->string('last_login_at')->nullable();
            $table->string('last_login_ip')->nullable();
            $table->string('last_login_location')->nullable();
            $table->string('last_login_device')->nullable();
            $table->string('last_login_country')->nullable();
            $table->string('last_login_timezone')->nullable();

            // Authentication
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
