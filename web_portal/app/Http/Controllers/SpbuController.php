<?php

namespace App\Http\Controllers;

use App\Models\Spbu;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SpbuController extends Controller
{
    public function index()
    {
        $spbus = Spbu::with('fuelStocks', 'operators.user')->get();
        return Inertia::render('Admin/Spbu', [
            'spbus' => $spbus
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:20|unique:spbu',
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'city' => 'required|string|max:255',
            'province' => 'required|string|max:255',
            'status' => 'required|in:active,inactive'
        ]);

        $spbu = Spbu::create($request->all());

        $fuelTypes = ['pertalite', 'solar', 'pertamax', 'pertamax_turbo', 'dex'];
        foreach ($fuelTypes as $type) {
            \App\Models\FuelStock::create([
                'spbu_id' => $spbu->id,
                'fuel_type' => $type,
                'status' => 'available',
                'last_updated_at' => now(),
            ]);
        }

        return redirect()->back()->with('success', 'SPBU berhasil ditambahkan.');
    }

    public function update(Request $request, Spbu $spbu)
    {
        $request->validate([
            'code' => 'required|string|max:20|unique:spbu,code,' . $spbu->id,
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'city' => 'required|string|max:255',
            'province' => 'required|string|max:255',
            'status' => 'required|in:active,inactive'
        ]);

        $spbu->update($request->all());

        return redirect()->back()->with('success', 'SPBU berhasil diperbarui.');
    }

    public function destroy(Spbu $spbu)
    {
        $spbu->delete();
        return redirect()->back()->with('success', 'SPBU berhasil dihapus.');
    }
}
