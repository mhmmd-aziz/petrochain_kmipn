<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spbu', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->text('address');
            $table->string('city');
            $table->string('province');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('operators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('spbu_id')->constrained('spbu')->onDelete('cascade');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('fuel_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('spbu_id')->constrained('spbu')->onDelete('cascade');
            $table->enum('fuel_type', ['pertalite', 'solar', 'pertamax', 'pertamax_turbo', 'dex']);
            $table->enum('status', ['available', 'empty', 'limited'])->default('available');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('last_updated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fuel_stocks');
        Schema::dropIfExists('operators');
        Schema::dropIfExists('spbu');
    }
};
