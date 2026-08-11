<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('spbu_id')->nullable()->constrained('spbu')->nullOnDelete();
            $table->foreignId('operator_id')->nullable()->constrained('operators')->nullOnDelete();
            $table->enum('fuel_type', ['pertalite', 'solar', 'pertamax', 'pertamax_turbo', 'dex']);
            $table->decimal('volume', 8, 2)->nullable();
            $table->enum('qr_result', ['qr_match', 'qr_not_match', 'manual_review'])->nullable();
            $table->string('plate_result')->nullable();
            $table->decimal('plate_confidence', 5, 4)->nullable();
            $table->string('yolo_result')->nullable();
            $table->decimal('yolo_confidence', 5, 4)->nullable();
            $table->enum('transaction_status', [
                'pending',
                'validated',
                'rejected',
                'manual_review'
            ])->default('pending');
            $table->string('blockchain_reference')->nullable();
            $table->timestamp('transacted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('vehicle_detections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->string('model_name');
            $table->string('model_version')->nullable();
            $table->string('detected_class')->nullable();
            $table->decimal('confidence', 5, 4)->nullable();
            $table->integer('engine_capacity_cc')->nullable();
            $table->enum('eligibility_result', ['eligible', 'not_eligible', 'manual_review'])->nullable();
            $table->json('raw_result')->nullable();
            $table->timestamps();
        });

        Schema::create('blockchain_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->string('block_reference')->nullable();
            $table->string('transaction_hash')->unique();
            $table->string('previous_hash')->nullable();
            $table->string('digital_signature')->nullable();
            $table->string('payload_hash');
            $table->json('payload_data');
            $table->enum('status', ['pending', 'confirmed', 'failed'])->default('pending');
            $table->timestamp('recorded_at')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->string('entity_type')->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('metadata')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('blockchain_records');
        Schema::dropIfExists('vehicle_detections');
        Schema::dropIfExists('transactions');
    }
};
