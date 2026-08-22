<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Spbu;
use App\Models\FuelStock;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@petrochain.id'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        $auditor = User::firstOrCreate(
            ['email' => 'auditor@petrochain.id'],
            [
                'name' => 'Auditor (BPH Migas)',
                'password' => Hash::make('password'),
                'role' => 'auditor',
                'status' => 'active',
            ]
        );

        $publicUser = User::firstOrCreate(
            ['email' => 'user@gmail.com'],
            [
                'name' => 'Budi Santoso (Public)',
                'password' => Hash::make('password'),
                'role' => 'public',
                'status' => 'active',
            ]
        );

        // 2. Call DummyTransactionSeeder to create SPBU, Operator, Vehicles, and Transactions
        $this->call([
            DummyTransactionSeeder::class,
        ]);

        // 3. Create Fuel Stocks for the SPBU created in DummyTransactionSeeder
        $spbu = Spbu::where('code', '14.201.001')->first();
        if ($spbu) {
            FuelStock::firstOrCreate(
                ['spbu_id' => $spbu->id, 'fuel_type' => 'pertalite'],
                ['status' => 'available']
            );
            FuelStock::firstOrCreate(
                ['spbu_id' => $spbu->id, 'fuel_type' => 'solar'],
                ['status' => 'available']
            );
        }

        // 4. Seed Vehicles and Registration Applications for Public User
        $vPublic1 = \App\Models\Vehicle::firstOrCreate(
            ['plate_number' => 'BL 1234 AB'],
            [
                'user_id' => $publicUser->id,
                'vehicle_type' => 'motorcycle',
                'brand' => 'Honda',
                'model' => 'Vario 125 CBS',
                'engine_capacity_cc' => 125,
                'registration_status' => 'approved',
                'qr_code_path' => 'dummy_qr_vario.png'
            ]
        );

        \App\Models\RegistrationApplication::firstOrCreate(
            ['vehicle_id' => $vPublic1->id, 'user_id' => $publicUser->id],
            [
                'stnk_file' => 'registrations/stnk/sample_stnk_vario.jpg',
                'vehicle_photo' => 'registrations/vehicle_photo/sample_vario_motor.jpg',
                'status' => 'approved',
                'submitted_at' => now()->subDays(2),
                'reviewed_at' => now()->subDays(1),
                'reviewer_id' => $admin->id,
                'admin_notes' => 'STNK dan Foto Fisik valid. Kapasitas 125cc memenuhi syarat subsidi Perpres 191/2014.'
            ]
        );

        $vPublic2 = \App\Models\Vehicle::firstOrCreate(
            ['plate_number' => 'BK 4567 CD'],
            [
                'user_id' => $publicUser->id,
                'vehicle_type' => 'car',
                'brand' => 'Toyota',
                'model' => 'Avanza 1.3 E',
                'engine_capacity_cc' => 1329,
                'registration_status' => 'pending',
                'qr_code_path' => null
            ]
        );

        \App\Models\RegistrationApplication::firstOrCreate(
            ['vehicle_id' => $vPublic2->id, 'user_id' => $publicUser->id],
            [
                'stnk_file' => 'registrations/stnk/sample_stnk_avanza.jpg',
                'vehicle_photo' => 'registrations/vehicle_photo/sample_avanza_car.jpg',
                'status' => 'pending_review',
                'submitted_at' => now()->subHours(4),
                'reviewed_at' => null,
                'reviewer_id' => null,
                'admin_notes' => null
            ]
        );
    }
}
