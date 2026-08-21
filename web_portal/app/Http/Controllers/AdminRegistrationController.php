<?php

namespace App\Http\Controllers;

use App\Models\RegistrationApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AdminRegistrationController extends Controller
{
    public function dashboard()
    {
        $totalTx = \App\Models\Transaction::count();
        $matchTx = \App\Models\Transaction::where('qr_result', 'qr_match')->count();
        $qrMatchRate = $totalTx > 0 ? round(($matchTx / $totalTx) * 100, 1) : 100;

        $chartLabels = [];
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = today()->subDays($i);
            $chartLabels[] = $date->translatedFormat('D');
            $chartData[] = \App\Models\Transaction::whereDate('transacted_at', $date)->count();
        }

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_spbu' => \App\Models\Spbu::count(),
                'daily_transactions' => \App\Models\Transaction::whereDate('transacted_at', today())->count(),
                'pending_registrations' => \App\Models\RegistrationApplication::where('status', 'pending_review')->count(),
                'registered_vehicles' => \App\Models\Vehicle::where('registration_status', 'approved')->count(),
                'qr_match_rate' => $qrMatchRate,
                'active_operators' => \App\Models\Operator::where('status', 'active')->count(),
            ],
            'chart_data' => [
                'labels' => $chartLabels,
                'data' => $chartData
            ],
            'recent_transactions' => \App\Models\Transaction::with('spbu')->latest('transacted_at')->take(5)->get()->map(function($tx) {
                return [
                    'id' => $tx->id,
                    'plate_number' => $tx->plate_result,
                    'spbu_name' => $tx->spbu ? $tx->spbu->name : '-',
                    'fuel_type' => $tx->fuel_type,
                    'qr_result' => $tx->qr_result,
                    'status' => $tx->transaction_status,
                    'transacted_at' => $tx->transacted_at->format('Y-m-d H:i')
                ];
            }),
        ]);
    }

    public function index()
    {
        $applications = RegistrationApplication::with(['vehicle', 'user', 'ocrResults'])
            ->latest()
            ->get();

        return Inertia::render('Admin/Registrations', [
            'applications' => $applications,
        ]);
    }

    public function review(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,needs_reupload',
            'admin_notes' => 'nullable|string',
        ]);

        $application = RegistrationApplication::with('vehicle')->findOrFail($id);
        
        $application->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
            'reviewed_at' => now(),
            'reviewer_id' => $request->user()->id,
        ]);

        $vehicle = $application->vehicle;

        if ($request->status === 'approved') {
            // Generate QR Code token logic
            $token = Str::random(32);
            $vehicle->update([
                'registration_status' => 'approved',
                'qr_code_token' => $token,
                'qr_generated_at' => now(),
            ]);
            // Here, you would typically also generate an actual QR code image and store its path in 'qr_code_path'
        } else if ($request->status === 'rejected') {
            $vehicle->update(['registration_status' => 'rejected']);
        }

        return back()->with('success', 'Aplikasi berhasil direview.');
    }
}
