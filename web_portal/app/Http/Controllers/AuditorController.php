<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transaction;

class AuditorController extends Controller
{
    public function dashboard()
    {
        $transactions = Transaction::with('spbu')->get();
        $totalTx = $transactions->count();
        
        $tampered = 0;
        $valid = 0;
        
        foreach($transactions as $tx) {
            $spbuCode = $tx->spbu->code ?? '14.201.001';
            $plateResult = $tx->plate_result ?? '';
            $dataString = "{$tx->id}|{$plateResult}|{$tx->fuel_type}|{$tx->volume}|{$spbuCode}";
            $hash = hash('sha256', $dataString);
            
            if ($tx->blockchain_reference && $hash !== $tx->blockchain_reference) {
                $tampered++;
            } else {
                $valid++;
            }
        }
        
        $complianceRate = ($totalTx > 0) ? round(($valid / $totalTx) * 100, 1) : 100;

        $stats = [
            'total_spbu' => \App\Models\Spbu::count(),
            'total_transactions' => $totalTx,
            'compliance_rate' => $complianceRate,
            'audit_alerts' => $tampered
        ];

        return Inertia::render('Auditor/Dashboard', [
            'stats' => $stats
        ]);
    }

    public function transactions()
    {
        $transactions = Transaction::with(['spbu', 'vehicle'])
            ->latest('transacted_at')
            ->paginate(50);

        return Inertia::render('Auditor/Transactions', [
            'transactions' => $transactions
        ]);
    }
}
