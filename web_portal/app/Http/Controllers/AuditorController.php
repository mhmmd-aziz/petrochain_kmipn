<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transaction;

class AuditorController extends Controller
{
    public function dashboard()
    {
        // Mock data for auditor dashboard
        $stats = [
            'total_spbu' => \App\Models\Spbu::count(),
            'total_transactions' => Transaction::count(),
            'compliance_rate' => 98.5,
            'audit_alerts' => 3
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
