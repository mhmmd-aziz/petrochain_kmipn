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
    }
}
