<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transaction;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['vehicle', 'spbu', 'operator.user'])
            ->latest('transacted_at');

        if ($request->user()->role === 'public') {
            $query->whereHas('vehicle', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            });
        }

        $transactions = $query->get();

        return Inertia::render('Admin/Transactions', [
            'transactions' => $transactions
        ]);
    }
}
