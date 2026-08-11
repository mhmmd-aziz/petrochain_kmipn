<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('plate_number', 20);
            $table->enum('vehicle_type', ['car', 'motorcycle', 'truck', 'bus']);
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('color')->nullable();
            $table->integer('year')->nullable();
            $table->integer('engine_capacity_cc')->nullable();
            $table->enum('registration_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('qr_code_path')->nullable();
            $table->string('qr_code_token')->nullable()->unique();
            $table->timestamp('qr_generated_at')->nullable();
            $table->timestamps();
        });

        Schema::create('registration_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('stnk_file');
            $table->string('vehicle_photo')->nullable();
            $table->enum('status', [
                'pending_review',
                'ocr_processing',
                'match',
                'mismatch',
                'approved',
                'rejected',
                'needs_reupload'
            ])->default('pending_review');
            $table->text('admin_notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('ocr_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registration_application_id')->constrained()->onDelete('cascade');
            $table->enum('source_type', ['stnk', 'vehicle_photo']);
            $table->string('extracted_plate')->nullable();
            $table->decimal('confidence', 5, 4)->nullable();
            $table->text('raw_result')->nullable();
            $table->string('normalized_result')->nullable();
            $table->enum('comparison_result', ['match', 'mismatch', 'pending', 'low_confidence'])->nullable();
            $table->string('engine')->nullable();
            $table->string('model_version')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ocr_results');
        Schema::dropIfExists('registration_applications');
        Schema::dropIfExists('vehicles');
    }
};
