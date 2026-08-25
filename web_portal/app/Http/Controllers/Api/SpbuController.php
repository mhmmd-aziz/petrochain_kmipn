<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vehicle;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SpbuController extends Controller
{
    /**
     * Get list of active SPBUs with fuel stocks for mobile app homepage
     */
    public function publicList()
    {
        $spbus = \App\Models\Spbu::with('fuelStocks')->where('status', 'active')->get();
        return response()->json([
            'status' => 'success',
            'data' => $spbus
        ]);
    }

    /**
     * Validate QR Code from User's app
     * Expects qr_code string
     */
    public function validateQr(Request $request)
    {
        $request->validate([
            'qr_code' => 'required|string',
        ]);

        $vehicle = Vehicle::where('qr_code_token', $request->qr_code)->first();

        if (!$vehicle) {
            return response()->json([
                'status' => 'error',
                'message' => 'QR Code invalid or not found'
            ], 404);
        }

        if ($vehicle->registration_status !== 'approved') {
            return response()->json([
                'status' => 'error',
                'message' => 'Kendaraan ini belum disetujui untuk subsidi',
                'data' => [
                    'plate_number' => $vehicle->plate_number,
                    'status' => $vehicle->registration_status
                ]
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'QR Code Valid',
            'data' => [
                'vehicle_id' => $vehicle->id,
                'plate_number' => $vehicle->plate_number,
                'vehicle_type' => $vehicle->vehicle_type,
                'brand' => $vehicle->brand,
                'model' => $vehicle->model,
            ]
        ]);
    }

    /**
     * Validate Physical Vehicle against the QR data using YOLO+OCR service at Port 5003
     */
    public function validateVehicle(Request $request)
    {
        $request->validate([
            'vehicle_id' => 'required|integer',
            'vehicle_image' => 'required|image|max:5120',
        ]);

        $vehicle = null;
        if ($request->vehicle_id > 0) {
            $vehicle = Vehicle::findOrFail($request->vehicle_id);
        }
        
        // Save image temporarily
        $imagePath = $request->file('vehicle_image')->store('temp', 'public');
        $absPath = storage_path('app/public/' . $imagePath);

        // Call OCR SPBU Service
        try {
            $response = Http::timeout(15)->attach(
                'file', file_get_contents($absPath), basename($absPath)
            )->post(env('AI_OCR_SPBU_URL', 'http://127.0.0.1:5003') . '/detect');

            if ($response->successful()) {
                $aiResult = $response->json();
                
                // Compare plate with registered plate
                $isMatch = false;
                $detectedPlate = null;
                $confidence = 0;

                if (!empty($aiResult['detections'])) {
                    $bestDetection = $aiResult['detections'][0]; // Assume first detection is the main vehicle
                    $detectedPlate = $bestDetection['plate_text'] ?? null;
                    $confidence = $bestDetection['confidence_ocr'] ?? 0;

                    if ($vehicle && $detectedPlate) {
                        $cleanDetected = str_replace(' ', '', strtoupper($detectedPlate));
                        $cleanRegistered = str_replace(' ', '', strtoupper($vehicle->plate_number));
                        
                        if ($cleanDetected === $cleanRegistered || strpos($cleanDetected, $cleanRegistered) !== false || strpos($cleanRegistered, $cleanDetected) !== false) {
                            $isMatch = true;
                        }
                    } else if (!$vehicle) {
                        // For No QR, we can't match it, but we still return the detected plate
                        $isMatch = true; // Auto-match to allow transaction flow
                    }
                }

                // Delete temp file
                @unlink($absPath);

                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'registered_plate' => $vehicle ? $vehicle->plate_number : 'TANPA QR',
                        'detected_plate' => $detectedPlate,
                        'confidence' => $confidence,
                        'is_match' => $isMatch,
                        'annotated_image' => $aiResult['annotated'] ?? null,
                    ]
                ]);
            }
            
            Log::error('SPBU OCR Service Error: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('SPBU OCR Service Connection Failed: ' . $e->getMessage());
        }

        @unlink($absPath);

        return response()->json([
            'status' => 'error',
            'message' => 'Gagal terhubung ke layanan AI SPBU'
        ], 500);
    }

    /**
     * Submit a new fuel transaction and validate daily quota limits
     */
    public function submitTransaction(Request $request)
    {
        $request->validate([
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'fuel_type' => 'required|string|in:pertalite,solar',
            'volume' => 'required|numeric|min:0.1|max:200',
            'qr_result' => 'required|string', // e.g., match, mismatch, no_qr
            'plate_result' => 'nullable|string',
            'plate_confidence' => 'nullable|numeric',
            'is_override' => 'nullable|boolean',
        ]);

        $volume = (float) $request->volume;
        $fuelType = strtolower($request->fuel_type);
        $vehicleId = $request->vehicle_id;
        
        $maxQuota = 20; // Default limit for Non-QR (20L)
        $isMotor = false;

        if ($vehicleId) {
            $vehicle = Vehicle::find($vehicleId);
            $isMotor = ($vehicle->vehicle_type === 'motor');
            
            if ($isMotor) {
                $maxQuota = 9999; // Motor tidak ada limit liter
            } else if ($fuelType === 'pertalite') {
                $maxQuota = 60;
            } else if ($fuelType === 'solar') {
                if ($vehicle->vehicle_type === 'mobil_pribadi') {
                    $maxQuota = 60;
                } else if ($vehicle->vehicle_type === 'angkutan_umum') {
                    $maxQuota = 80;
                } else {
                    $maxQuota = 200; // angkutan_barang
                }
            }

            // Calculate used quota today
            $usedToday = \App\Models\Transaction::where('vehicle_id', $vehicleId)
                ->whereDate('transacted_at', now()->toDateString())
                ->sum('volume');

            if (!$isMotor && ($usedToday + $volume > $maxQuota)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal: Kuota harian habis. Sisa kuota hari ini: ' . max(0, $maxQuota - $usedToday) . ' Liter.',
                    'data' => [
                        'used_today' => $usedToday,
                        'max_quota' => $maxQuota,
                    ]
                ], 422);
            }
        } else {
            // For No QR, we track daily quota strictly using the detected plate text (OCR result).
            $maxQuota = 20;

            if (empty($request->plate_result) || $request->plate_result === '-' || strpos(strtoupper($request->plate_result), 'TANPA QR') !== false) {
                 return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal: Pelat nomor tidak terdeteksi oleh AI. Transaksi tanpa QR wajib menangkap pelat nomor fisik untuk mencegah penimbunan.',
                 ], 422);
            }

            // Clean the plate text for accurate comparison (remove spaces, uppercase)
            $cleanPlate = str_replace(' ', '', strtoupper($request->plate_result));
            
            // Calculate used quota today by this specific physical plate
            $usedToday = \App\Models\Transaction::where(function($q) {
                    $q->whereNull('vehicle_id')->orWhere('qr_result', 'no_qr');
                })
                ->whereDate('transacted_at', now()->toDateString())
                ->whereRaw("REPLACE(UPPER(plate_result), ' ', '') = ?", [$cleanPlate])
                ->sum('volume');

            if ($usedToday + $volume > $maxQuota) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal: Kuota harian habis. Pelat ' . $request->plate_result . ' hanya tersisa ' . max(0, $maxQuota - $usedToday) . ' Liter hari ini.',
                    'data' => [
                        'used_today' => $usedToday,
                        'max_quota' => $maxQuota,
                    ]
                ], 422);
            }
        }

        // We assume the operator is authenticated via Sanctum, but since this is a mockup, 
        // we'll fetch a dummy operator or from request user
        $operator = $request->user() ? $request->user()->operator : \App\Models\Operator::first();
        $spbuId = $operator ? $operator->spbu_id : (\App\Models\Spbu::first()->id ?? 1);
        $operatorId = $operator ? $operator->id : 1;

        $transaction = \App\Models\Transaction::create([
            'vehicle_id' => $vehicleId,
            'spbu_id' => $spbuId,
            'operator_id' => $operatorId,
            'fuel_type' => $fuelType,
            'volume' => $volume,
            'qr_result' => $request->qr_result,
            'plate_result' => $request->plate_result,
            'plate_confidence' => $request->plate_confidence,
            'transaction_status' => $request->is_override ? 'manual_override' : ($request->qr_result === 'match' ? 'approved' : 'pending_review'),
            'transacted_at' => now(),
            // yolo_result and confidence are omitted for simplicity in this endpoint
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Transaksi berhasil dicatat dan kuota dipotong.',
            'data' => $transaction
        ], 201);
    }
}
