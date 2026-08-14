<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Transaction;
use App\Models\Vehicle;
use App\Models\Spbu;
use App\Models\Operator;
use App\Models\User;

class DummyTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan kita punya setidaknya 1 SPBU dan 1 Operator
        $spbu = Spbu::firstOrCreate(
            ['code' => '14.201.001'],
            ['name' => 'SPBU Utama Lhokseumawe', 'address' => 'Jl. Medan Banda Aceh', 'city' => 'Lhokseumawe', 'province' => 'Aceh', 'status' => 'active']
        );

        $operatorUser = User::firstOrCreate(
            ['email' => 'operator1@petrochain.id'],
            ['name' => 'Budi (Operator)', 'password' => bcrypt('password'), 'role' => 'operator']
        );

        $operator = Operator::firstOrCreate(
            ['user_id' => $operatorUser->id],
            ['spbu_id' => $spbu->id, 'status' => 'active']
        );

        // Buat beberapa kendaraan dummy jika belum ada
        $v1 = Vehicle::firstOrCreate(['plate_number' => 'BL 1234 AB'], ['user_id' => 1, 'vehicle_type' => 'car', 'brand' => 'Toyota', 'model' => 'Avanza', 'registration_status' => 'approved', 'qr_code_path' => 'dummy_qr_1.png']);
        $v2 = Vehicle::firstOrCreate(['plate_number' => 'BL 5678 CD'], ['user_id' => 1, 'vehicle_type' => 'car', 'brand' => 'Honda', 'model' => 'Brio', 'registration_status' => 'approved', 'qr_code_path' => 'dummy_qr_2.png']);
        $v3 = Vehicle::firstOrCreate(['plate_number' => 'BL 9012 EF'], ['user_id' => 1, 'vehicle_type' => 'motorcycle', 'brand' => 'Yamaha', 'model' => 'NMAX', 'registration_status' => 'approved', 'qr_code_path' => 'dummy_qr_3.png']);

        // Buat Dummy Transaksi
        Transaction::insert([
            [
                'vehicle_id' => $v1->id,
                'spbu_id' => $spbu->id,
                'operator_id' => $operator->id,
                'fuel_type' => 'Pertalite',
                'volume' => 20.5,
                'qr_result' => 'qr_match',
                'plate_result' => 'BL 1234 AB',
                'plate_confidence' => 0.98,
                'yolo_result' => 'car',
                'yolo_confidence' => 0.95,
                'transaction_status' => 'validated',
                'blockchain_reference' => null,
                'transacted_at' => now()->subHours(2),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'vehicle_id' => $v2->id,
                'spbu_id' => $spbu->id,
                'operator_id' => $operator->id,
                'fuel_type' => 'Solar',
                'volume' => 15.0,
                'qr_result' => 'qr_match',
                'plate_result' => 'BL 5678 CC', // Sengaja mismatch dikit
                'plate_confidence' => 0.75,
                'yolo_result' => 'car',
                'yolo_confidence' => 0.88,
                'transaction_status' => 'manual_review',
                'blockchain_reference' => null,
                'transacted_at' => now()->subHours(5),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'vehicle_id' => $v3->id,
                'spbu_id' => $spbu->id,
                'operator_id' => $operator->id,
                'fuel_type' => 'Pertalite',
                'volume' => 4.2,
                'qr_result' => 'qr_not_match', // Sengaja ditolak
                'plate_result' => 'BK 1111 XX', 
                'plate_confidence' => 0.99,
                'yolo_result' => 'motorcycle',
                'yolo_confidence' => 0.96,
                'transaction_status' => 'rejected',
                'blockchain_reference' => null,
                'transacted_at' => now()->subDays(1),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
