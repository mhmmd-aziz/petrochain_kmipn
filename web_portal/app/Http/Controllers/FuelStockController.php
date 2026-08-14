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
}
