<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Carbon\Carbon;

class IotController extends Controller
{
    /**
     * Get the latest validated transaction within the last 15 seconds.
     * Used by ESP32 to trigger dispensing.
     */
    public function getLatestTransaction()
    {
        // Get the latest transaction that was validated recently (e.g., last 15 seconds)
        // using transacted_at to check when it was recorded
        $latestTx = Transaction::with('vehicle')
            ->where('transaction_status', 'validated')
            ->where('transacted_at', '>=', Carbon::now()->subMinutes(2))
            ->orderBy('transacted_at', 'desc')
            ->first();

        if (!$latestTx) {
            return response()->json([
                'status' => 'idle',
                'message' => 'No recent transactions.'
            ]);
        }

        return response()->json([
            'status' => 'dispense',
            'transaction_id' => $latestTx->id,
            'plate_number' => $latestTx->plate_result ?? ($latestTx->vehicle ? $latestTx->vehicle->plate_number : 'UNKNOWN'),
            'volume_liters' => (float) ($latestTx->original_volume ?? $latestTx->volume ?? 0),
        ]);
    }
}
