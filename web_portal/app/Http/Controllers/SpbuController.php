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
            'status' => 'required|in:active,inactive',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048'
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('spbu_images', 'public');
        }

        $spbu = Spbu::create($data);

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
            'status' => 'required|in:active,inactive',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048'
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            // Optional: Delete old image if exists
            // if ($spbu->image_path) {
            //     \Illuminate\Support\Facades\Storage::disk('public')->delete($spbu->image_path);
            // }
            $data['image_path'] = $request->file('image')->store('spbu_images', 'public');
        }

        $spbu->update($data);

        return redirect()->back()->with('success', 'SPBU berhasil diperbarui.');
    }

    public function destroy(Spbu $spbu)
    {
        $spbu->delete();
        return redirect()->back()->with('success', 'SPBU berhasil dihapus.');
    }
}
