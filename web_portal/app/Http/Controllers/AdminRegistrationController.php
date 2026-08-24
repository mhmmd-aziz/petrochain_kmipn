<?php

namespace App\Http\Controllers;

use App\Models\RegistrationApplication;
use App\Models\OcrResult;
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
            $token = Str::random(32);
            $vehicle->update([
                'registration_status' => 'approved',
                'qr_code_token' => $token,
                'qr_generated_at' => now(),
            ]);
        } else if ($request->status === 'rejected') {
            $vehicle->update(['registration_status' => 'rejected']);
        }

        return back()->with('success', 'Aplikasi berhasil direview.');
    }

    /**
     * Re-run AI OCR analysis on existing submitted images.
     * Useful when AI service was offline during initial submission.
     */
    public function rerunAi(Request $request, $id)
    {
        $application = RegistrationApplication::with('vehicle')->findOrFail($id);

        $absStnkPath = storage_path('app/public/' . $application->stnk_file);
        $absCarPath  = storage_path('app/public/' . $application->vehicle_photo);

        if (!file_exists($absStnkPath) || !file_exists($absCarPath)) {
            return back()->with('error', 'File foto tidak ditemukan di server. Minta pengguna untuk upload ulang.');
        }

        $aiService = new \App\Services\AiVerificationService();
        $aiResult  = $aiService->extractPlates($absStnkPath, $absCarPath);

        if (!$aiResult || ($aiResult['stnk_plate'] ?? '') === 'ERROR: SERVICE OFFLINE') {
            return back()->with('error', 'Layanan AI masih offline atau tidak merespons. Coba lagi nanti.');
        }

        // Delete old OCR results and re-insert fresh ones
        OcrResult::where('registration_application_id', $application->id)->delete();

        $detectedCc    = $aiResult['stnk_cc'] ?? null;
        $isWarning     = $aiResult['is_warning'] ?? false;
        $documentValid = $aiResult['document_valid'] ?? true;

        // Re-save STNK OCR result
        OcrResult::create([
            'registration_application_id' => $application->id,
            'source_type'                 => 'stnk',
            'extracted_plate'             => $aiResult['stnk_plate'],
            'confidence'                  => $aiResult['stnk_confidence'] ?? 0.0,
            'normalized_result'           => ($aiResult['stnk_plate'] ?? '')
                . ($detectedCc ? ' | ' . $detectedCc . ' CC' : '')
                . (isset($aiResult['document_type']) ? ' | DOC:' . $aiResult['document_type'] : ''),
            'comparison_result'           => $aiResult['conclusion'] ?? 'low_confidence',
            'engine'                      => 'easyocr',
            'processed_at'                => now(),
        ]);

        // Re-save Vehicle photo OCR result
        OcrResult::create([
            'registration_application_id' => $application->id,
            'source_type'                 => 'vehicle_photo',
            'extracted_plate'             => $aiResult['car_plate'],
            'confidence'                  => $aiResult['car_confidence'] ?? 0.0,
            'normalized_result'           => ($aiResult['car_plate'] ?? '')
                . (isset($aiResult['car_detected_type']) ? ' | CAR:' . $aiResult['car_detected_type'] : ''),
            'comparison_result'           => $aiResult['conclusion'] ?? 'low_confidence',
            'engine'                      => 'yolo+easyocr',
            'processed_at'                => now(),
        ]);

        // Build admin notes from AI warnings
        $notes = null;
        if (($isWarning || !$documentValid) && !empty($aiResult['validation_message'])) {
            $notes = '[AI WARNING] ' . $aiResult['validation_message'];
        }

        // Motorcycle over-250cc classification check
        $vehicle      = $application->vehicle;
        $documentType = $aiResult['document_type'] ?? 'unknown';
        $isMotorcycle = ($vehicle->vehicle_type ?? '') === 'motorcycle'
            || str_contains($documentType, 'motorcycle')
            || (isset($aiResult['car_detected_type']) && $aiResult['car_detected_type'] === 'motorcycle');

        if ($isMotorcycle) {
            $motorClassResult = $aiService->classifyMotorcycle($absCarPath);
            if ($motorClassResult) {
                $eligibility   = $motorClassResult['eligibility_result'] ?? 'UNKNOWN';
                $detectedClass = $motorClassResult['detected_class'] ?? 'unknown';
                if ($eligibility === 'NOT_ELIGIBLE') {
                    $motorWarning = '[AI WARNING] YOLO mendeteksi motor OVER 250cc (' . strtoupper($detectedClass) . '). Mohon tolak.';
                    $notes = $notes ? $notes . "\n" . $motorWarning : $motorWarning;
                }
            }
        }

        // CC compliance check
        $ccToValidate = $detectedCc ?: ($vehicle->engine_capacity_cc ?? null);
        if (($vehicle->fuel_type ?? '') === 'pertalite' && $ccToValidate && intval($ccToValidate) > 1400) {
            $ccWarning = '[AI WARNING] Kapasitas mesin ' . $ccToValidate . ' CC melebihi batas regulasi Pertalite (maks 1400 CC).';
            $notes = $notes ? $notes . "\n" . $ccWarning : $ccWarning;
        }

        // Cek Duplikasi Berbasis OCR STNK
        $ocrPlate = strtoupper(str_replace(' ', '', $aiResult['stnk_plate'] ?? ''));
        if (!empty($ocrPlate)) {
            $isDuplicate = \App\Models\Vehicle::where('plate_number', $ocrPlate)
                ->where('registration_status', 'approved')
                ->where('id', '!=', $application->vehicle_id)
                ->exists();

            if ($isDuplicate) {
                $duplicateWarning = '[AI WARNING] 🚨 DUPLIKASI TERDETEKSI: Pelat dari dokumen STNK ini sudah terdaftar dan aktif atas nama pengguna lain. Indikasi pemalsuan dokumen atau STNK ganda.';
                $notes = $notes ? $notes . "\n" . $duplicateWarning : $duplicateWarning;
            }
        }

        $application->update([
            'admin_notes' => $notes,
            'status'      => 'pending_review',
        ]);

        return back()->with('success', 'AI berhasil dijalankan ulang! Data OCR telah diperbarui.');
    }
}
