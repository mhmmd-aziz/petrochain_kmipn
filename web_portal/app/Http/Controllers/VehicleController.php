<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleController extends Controller
{
    public function index()
    {
        $vehicles = Vehicle::with('user')->get();
        $users = User::where('role', 'public')->select('id', 'name', 'email')->get();
        
        // Calculate dynamic quota for each approved vehicle
        foreach ($vehicles as $vehicle) {
            if ($vehicle->registration_status === 'approved') {
                $fuelType = strtolower($vehicle->fuel_type ?? 'pertalite');
                $isMotor = ($vehicle->vehicle_type === 'motor');
                
                if ($isMotor) {
                    $maxQuota = 9999;
                } else if ($fuelType === 'solar' || $fuelType === 'biosolar') {
                    $maxQuota = match($vehicle->vehicle_type) {
                        'angkutan_umum' => 80,
                        'angkutan_barang' => 200,
                        default => 50,
                    };
                } else {
                    $maxQuota = 50;
                }

                $usedToday = \App\Models\Transaction::where('vehicle_id', $vehicle->id)
                    ->whereDate('transacted_at', now()->toDateString())
                    ->sum(\Illuminate\Support\Facades\DB::raw('COALESCE(original_volume, volume)'));

                $vehicle->max_quota = $maxQuota;
                $vehicle->used_today = $usedToday;
                $vehicle->remaining_quota = max(0, $maxQuota - $usedToday);
            }
        }

        return Inertia::render('Admin/Vehicles', [
            'vehicles' => $vehicles,
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'plate_number' => 'required|string|max:20|unique:vehicles',
            'vehicle_type' => 'required|in:mobil_pribadi,angkutan_umum,angkutan_barang,motor',
            'fuel_type' => 'required|string|max:50',
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'engine_capacity_cc' => 'required|integer',
            'registration_status' => 'required|in:pending,approved,rejected'
        ]);

        Vehicle::create($request->all());

        return redirect()->back()->with('success', 'Data kendaraan berhasil ditambahkan.');
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'plate_number' => 'required|string|max:20|unique:vehicles,plate_number,' . $vehicle->id,
            'vehicle_type' => 'required|in:mobil_pribadi,angkutan_umum,angkutan_barang,motor',
            'fuel_type' => 'required|string|max:50',
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'engine_capacity_cc' => 'required|integer',
            'registration_status' => 'required|in:pending,approved,rejected'
        ]);

        $vehicle->update($request->all());

        return redirect()->back()->with('success', 'Data kendaraan berhasil diperbarui.');
    }

    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();
        return redirect()->back()->with('success', 'Data kendaraan berhasil dihapus.');
    }
}
