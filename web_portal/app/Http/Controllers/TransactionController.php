<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Response;

class TransactionController extends Controller
{
    private function buildQuery(Request $request)
    {
        $query = Transaction::with(['vehicle', 'spbu', 'operator.user'])
            ->latest('transacted_at');

        // Role-based Isolation
        if ($request->user()->role === 'public') {
            $query->whereHas('vehicle', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            });
        } elseif ($request->user()->role === 'operator') {
            $operatorProfile = $request->user()->operatorProfile;
            if ($operatorProfile) {
                $query->where('spbu_id', $operatorProfile->spbu_id);
            }
        }

        // Filters
        if ($request->filled('start_date')) {
            $query->whereDate('transacted_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('transacted_at', '<=', $request->end_date);
        }
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'valid') {
                $query->whereIn('transaction_status', ['validated', 'approved']);
            } elseif ($request->status === 'rejected') {
                $query->whereIn('transaction_status', ['rejected', 'failed']);
            } elseif ($request->status === 'review') {
                $query->whereIn('transaction_status', ['manual_review', 'flagged']);
            } else {
                $query->where('transaction_status', $request->status);
            }
        }
        
        // Search by plate number
        if ($request->filled('search')) {
            $query->whereHas('vehicle', function($q) use ($request) {
                $q->where('plate_number', 'like', '%' . $request->search . '%');
            });
        }

        return $query;
    }

    public function index(Request $request)
    {
        $transactions = $this->buildQuery($request)->get();

        return Inertia::render('Admin/Transactions', [
            'transactions' => $transactions,
            'filters' => [
                'start_date' => $request->start_date ?? '',
                'end_date' => $request->end_date ?? '',
                'status' => $request->status ?? 'all',
                'search' => $request->search ?? ''
            ]
        ]);
    }

    public function exportPdf(Request $request)
    {
        $transactions = $this->buildQuery($request)->get();
        $user = $request->user();

        $pdf = Pdf::loadView('exports.transactions_pdf', [
            'transactions' => $transactions,
            'user' => $user,
            'filters' => $request->only(['start_date', 'end_date', 'status'])
        ]);

        return $pdf->download('Laporan_Transaksi_Petrochain_' . date('Ymd_His') . '.pdf');
    }

    public function exportCsv(Request $request)
    {
        $transactions = $this->buildQuery($request)->get();

        $filename = "Laporan_Transaksi_Petrochain_" . date('Ymd_His') . ".csv";

        $headers = array(
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        );

        $columns = ['ID', 'Waktu Transaksi', 'SPBU', 'Operator', 'Plat Nomor', 'Jenis Kendaraan', 'Jenis BBM', 'Volume (L)', 'Status QR', 'Status Audit'];

        $callback = function() use($transactions, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($transactions as $tx) {
                fputcsv($file, [
                    $tx->id,
                    $tx->transacted_at,
                    $tx->spbu->name ?? '-',
                    $tx->operator->user->name ?? '-',
                    $tx->vehicle->plate_number ?? '-',
                    ($tx->vehicle->brand ?? '') . ' ' . ($tx->vehicle->model ?? ''),
                    strtoupper($tx->fuel_type),
                    $tx->volume,
                    $tx->qr_result,
                    $tx->transaction_status
                ]);
            }
            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'volume' => 'required|numeric|min:0.1',
            'fuel_type' => 'required|string',
        ]);

        $transaction = Transaction::findOrFail($id);
        
        $updateData = [
            'volume' => $request->volume,
            'fuel_type' => strtolower($request->fuel_type),
        ];

        // Jika transaksi lama (sebelum ada kolom original) diedit, simpan state awalnya sbg original
        if (is_null($transaction->original_volume)) {
            $updateData['original_volume'] = $transaction->volume;
            $updateData['original_fuel_type'] = $transaction->fuel_type;
        }
        
        // Hanya update kolom data, TIDAK update blockchain_reference
        $transaction->update($updateData);

        return redirect()->back()->with('success', 'Transaksi berhasil diubah. Perubahan ini akan terdeteksi di audit Blockchain.');
    }
}
