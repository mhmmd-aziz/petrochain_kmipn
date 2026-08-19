<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\Vehicle;
use App\Models\Spbu;

class OperatorController extends Controller
{
    public function dashboard(Request $request)
    {
        $operator = $request->user()->operatorProfile;
        $spbu = $operator ? $operator->spbu : null;
        
        $recentTransactions = Transaction::with('vehicle')
            ->where('spbu_id', $spbu ? $spbu->id : null)
            ->latest('transacted_at')
            ->take(5)
            ->get();

        return Inertia::render('Operator/Dashboard', [
            'spbu' => $spbu,
            'recent_transactions' => $recentTransactions,
            'stats' => [
                'today_transactions' => 45, // Dummy stats
                'qr_scanned' => 50,
            ]
        ]);
    }

    public function validation(Request $request)
    {
        $operator = $request->user()->operatorProfile;
        $spbu = $operator ? $operator->spbu : null;

        return Inertia::render('Operator/Validation', [
            'spbu' => $spbu
        ]);
    }

    public function validationMotor(Request $request)
    {
        $operator = $request->user()->operatorProfile;
        $spbu = $operator ? $operator->spbu : null;

        return Inertia::render('Operator/ValidationMotor', [
            'spbu' => $spbu
        ]);
    }

    public function processValidation(Request $request)
    {
        $request->validate([
            'qr_code' => 'required|string',
            'fuel_type' => 'required|string',
            'volume' => 'required|numeric',
            // Mock YOLO & OCR data sent from frontend simulator
            'mock_plate' => 'required|string',
            'mock_yolo_class' => 'required|string',
        ]);

        $operator = $request->user()->operatorProfile;
        
        // Find vehicle by QR code token or plate for demo
        // For demo, we just find by plate
        $vehicle = Vehicle::where('plate_number', $request->mock_plate)->first();
        
        $qrMatch = $vehicle ? 'qr_match' : 'qr_not_match';
        $status = $vehicle ? 'validated' : 'manual_review';

        $tx = Transaction::create([
            'vehicle_id' => $vehicle ? $vehicle->id : null,
            'spbu_id' => $operator->spbu_id,
            'operator_id' => $operator->id,
            'fuel_type' => $request->fuel_type,
            'volume' => $request->volume,
            'qr_result' => $qrMatch,
            'plate_result' => $request->mock_plate,
            'plate_confidence' => 0.95,
            'yolo_result' => $request->mock_yolo_class,
            'yolo_confidence' => 0.90,
            'transaction_status' => $status,
            'transacted_at' => now(),
        ]);

        if ($status === 'validated') {
            // Generate SHA-256 hash of transaction
            $spbuCode = $operator->spbu->code ?? 'UNKNOWN';
            $dataString = "{$tx->id}|{$request->mock_plate}|{$request->fuel_type}|{$request->volume}|{$spbuCode}";
            $dataHash = hash('sha256', $dataString);
            
            // Send to Blockchain
            $blockchain = app(\App\Services\BlockchainService::class);
            $success = $blockchain->recordTransaction((string)$tx->id, $dataHash, $spbuCode);
            
            if ($success) {
                $tx->update(['blockchain_reference' => $dataHash]);
            }
        }

        return redirect()->route('operator.dashboard')->with('success', 'Transaksi berhasil diproses: ' . $status);
    }
}
