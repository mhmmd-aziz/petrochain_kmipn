<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirect root ke dashboard
Route::get('/', function () {
    return redirect()->route('dashboard');
});

// Dashboard utama (sementara tanpa auth dulu untuk development)
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'stats' => [
            'total_spbu' => 12,
            'daily_transactions' => 348,
            'pending_registrations' => 23,
            'registered_vehicles' => 1204,
            'qr_match_rate' => 96.4,
            'active_operators' => 28,
        ],
        'recent_transactions' => [
            ['id' => 1, 'plate_number' => 'BL 1234 AB', 'spbu_name' => 'SPBU 14.201.001', 'fuel_type' => 'Pertalite', 'qr_result' => 'qr_match', 'status' => 'validated', 'transacted_at' => '2026-08-11 22:15'],
            ['id' => 2, 'plate_number' => 'BL 5678 CD', 'spbu_name' => 'SPBU 14.201.002', 'fuel_type' => 'Solar', 'qr_result' => 'qr_not_match', 'status' => 'rejected', 'transacted_at' => '2026-08-11 22:02'],
            ['id' => 3, 'plate_number' => 'BL 9012 EF', 'spbu_name' => 'SPBU 14.201.001', 'fuel_type' => 'Pertalite', 'qr_result' => 'qr_match', 'status' => 'validated', 'transacted_at' => '2026-08-11 21:58'],
            ['id' => 4, 'plate_number' => 'BL 3456 GH', 'spbu_name' => 'SPBU 14.201.003', 'fuel_type' => 'Pertalite', 'qr_result' => 'qr_match', 'status' => 'manual_review', 'transacted_at' => '2026-08-11 21:43'],
            ['id' => 5, 'plate_number' => 'BL 7890 IJ', 'spbu_name' => 'SPBU 14.201.002', 'fuel_type' => 'Solar', 'qr_result' => 'qr_match', 'status' => 'validated', 'transacted_at' => '2026-08-11 21:30'],
        ],
    ]);
})->name('dashboard');
