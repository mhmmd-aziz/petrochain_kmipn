<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

// Add image_url column if not exists
if (!Schema::hasColumn('spbu', 'image_url')) {
    Schema::table('spbu', function (Blueprint $table) {
        $table->string('image_url', 500)->nullable()->after('province');
    });
    echo "Added image_url column.\n";
}

// Update SPBU 1 (Lhokseumawe)
DB::table('spbu')->where('id', 1)->update([
    'latitude' => 5.1802,
    'longitude' => 97.1400,
    'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/SPBU_Pertamina_di_Jakarta.jpg/800px-SPBU_Pertamina_di_Jakarta.jpg'
]);

// Update SPBU 2 (H Aziz)
DB::table('spbu')->where('id', 2)->update([
    'latitude' => 5.1321,
    'longitude' => 97.3533,
    'image_url' => 'https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2022/07/04/1627918510.jpg'
]);

echo "Updated coordinates and images for SPBUs.\n";
