<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ubah dari ENUM ke STRING agar lebih fleksibel menampung data 'mobil_pribadi', dll.
        Schema::table('vehicles', function (Blueprint $table) {
            $table->string('vehicle_type')->change();
        });
    }

    public function down(): void
    {
        // 
    }
};
