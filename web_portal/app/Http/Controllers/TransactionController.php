<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transaction;

class TransactionController extends Controller
{
    public function index()
    {
        // Load transactions with relationships
        $transactions = Transaction::with(['vehicle', 'spbu', 'operator.user'])
            ->latest('transacted_at')
            ->get();

        return Inertia::render('Admin/Transactions', [
            'transactions' => $transactions
        ]);
    }
}
