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
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE fuel_stocks MODIFY COLUMN fuel_type VARCHAR(100)");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverting to ENUM is tricky without knowing exact contents, so we leave it as VARCHAR
    }
};
