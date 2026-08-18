<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\FuelStock;
use App\Models\Spbu;

class FuelStockController extends Controller
{
    public function publicIndex()
    {
        $spbus = Spbu::with('fuelStocks')->get();
        return Inertia::render('Public/Stock', [
            'spbus' => $spbus
        ]);
    }

    public function adminIndex()
    {
        $spbus = Spbu::with('fuelStocks', 'operators.user')->get();
        return Inertia::render('Admin/Spbu', [
            'spbus' => $spbus
        ]);
    }

    public function operatorIndex(Request $request)
    {
        $operator = $request->user()->operatorProfile;
        if (!$operator) {
            return redirect()->route('operator.dashboard')->with('error', 'Profil operator tidak ditemukan.');
        }

        $stocks = FuelStock::where('spbu_id', $operator->spbu_id)->get();

        if ($stocks->isEmpty()) {
            $fuelTypes = ['pertalite', 'solar', 'pertamax', 'pertamax_turbo', 'dex'];
            foreach ($fuelTypes as $type) {
                FuelStock::create([
                    'spbu_id' => $operator->spbu_id,
                    'fuel_type' => $type,
                    'status' => 'available',
                    'last_updated_at' => now(),
                ]);
            }
            $stocks = FuelStock::where('spbu_id', $operator->spbu_id)->get();
        }
        
        return Inertia::render('Operator/StockUpdate', [
            'stocks' => $stocks,
            'spbu' => $operator->spbu
        ]);
    }

    public function operatorUpdate(Request $request)
    {
        $request->validate([
            'stock_id' => 'required|exists:fuel_stocks,id',
            'status' => 'required|in:available,empty,limited'
        ]);

        $stock = FuelStock::findOrFail($request->stock_id);
        $stock->update([
            'status' => $request->status,
            'updated_by' => $request->user()->id,
            'last_updated_at' => now(),
        ]);

        return back()->with('success', 'Status stok bahan bakar berhasil diperbarui.');
    }

    public function operatorStore(Request $request)
    {
        $operator = $request->user()->operatorProfile;
        if (!$operator) {
            return redirect()->route('operator.dashboard')->with('error', 'Profil operator tidak ditemukan.');
        }

        $request->validate([
            'fuel_type' => 'required|string|max:100',
            'status' => 'required|in:available,empty,limited'
        ]);

        // Check if fuel type already exists for this SPBU
        $exists = FuelStock::where('spbu_id', $operator->spbu_id)
            ->where('fuel_type', $request->fuel_type)
            ->exists();

        if ($exists) {
            return back()->with('error', 'Jenis bahan bakar ini sudah ada di daftar Anda.');
        }

        FuelStock::create([
            'spbu_id' => $operator->spbu_id,
            'fuel_type' => $request->fuel_type,
            'status' => $request->status,
            'updated_by' => $request->user()->id,
            'last_updated_at' => now(),
        ]);

        return back()->with('success', 'Jenis bahan bakar berhasil ditambahkan.');
    }

    public function operatorDestroy(Request $request, $id)
    {
        $operator = $request->user()->operatorProfile;
        if (!$operator) {
            return redirect()->route('operator.dashboard')->with('error', 'Profil operator tidak ditemukan.');
        }

        $stock = FuelStock::findOrFail($id);
        
        // Ensure operator can only delete stocks belonging to their SPBU
        if ($stock->spbu_id !== $operator->spbu_id) {
            return back()->with('error', 'Akses ditolak.');
        }

        $stock->delete();

        return back()->with('success', 'Bahan bakar berhasil dihapus dari daftar.');
    }
}
