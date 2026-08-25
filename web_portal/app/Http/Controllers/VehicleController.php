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
