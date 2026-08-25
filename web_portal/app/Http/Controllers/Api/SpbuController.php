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
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'vehicle_image' => 'required|image|max:20480',
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
            )->post(env('AI_OCR_SPBU_URL', 'http://ai_ocr_spbu:5003') . '/detect');

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
                    }
                }

                // If No QR is used and we didn't match anything, provide a mock fallback
                if (!$vehicle) {
                    if (empty($detectedPlate)) {
                        $detectedPlate = "BL 1234 ABC";
                        $confidence = 1.0;
                    }
                    $isMatch = true; // Auto-match to allow transaction flow
                }

                // Delete temp file
                @unlink($absPath);

                // Get quota and fuel type
                $fuelType = null;
                $remainingQuota = null;
                $maxQuota = null;
                
                if ($vehicle) {
                    $fuelType = strtolower($vehicle->fuel_type ?? 'pertalite');
                    if ($fuelType === 'solar' || $fuelType === 'biosolar') {
                        $maxQuota = match($vehicle->vehicle_type) {
                            'angkutan_umum' => 80,
                            'angkutan_barang' => 200,
                            default => 50,
                        };
                    } else {
                        $maxQuota = 50;
                    }
                    
                    $usedToday = \App\Models\Transaction::where('vehicle_id', $vehicle->id)
                        ->whereDate('transacted_at', now()->toDateString())
                        ->sum('volume');
                        
                    $remainingQuota = max(0, $maxQuota - $usedToday);
                }

                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'registered_plate' => $vehicle ? $vehicle->plate_number : 'TANPA QR',
                        'detected_plate' => $detectedPlate,
                        'confidence' => $confidence,
                        'is_match' => $isMatch,
                        'annotated_image' => $aiResult['annotated'] ?? null,
                        'vehicle_type' => $vehicle ? $vehicle->vehicle_type : null,
                        'fuel_type' => $fuelType,
                        'remaining_quota' => $remainingQuota,
                        'max_quota' => $maxQuota
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
     * Validate Motor Capacity using AI Motor Classification service at Port 5001
     */
    public function validateMotor(Request $request)
    {
        $request->validate([
            'vehicle_image' => 'required|image|max:20480',
        ]);

        $imagePath = $request->file('vehicle_image')->store('temp', 'public');
        $absPath = storage_path('app/public/' . $imagePath);

        try {
            $response = Http::timeout(15)->attach(
                'file', file_get_contents($absPath), basename($absPath)
            )->post(env('AI_KLASIFIKASI_MOTOR_URL', 'http://ai_klasifikasi_motor:5001') . '/api/classify');

            if ($response->successful()) {
                $aiResult = $response->json();
                
                $isMatch = false;
                $detectedClass = null;
                $confidence = 0;

                if (isset($aiResult['data'])) {
                    $data = $aiResult['data'];
                    $detectedClass = $data['detected_class'] ?? null;
                    $confidence = $data['confidence'] ?? 0;
                    
                    if ($data['eligibility_result'] === 'ELIGIBLE') {
                        $isMatch = true;
                    }
                }

                // Delete temp file
                @unlink($absPath);

                // Get quota and fuel type
                $fuelType = null;
                $remainingQuota = null;
                $maxQuota = null;
                $vehicle = null;
                
                if ($request->vehicle_id) {
                    $vehicle = Vehicle::find($request->vehicle_id);
                }

                if ($vehicle) {
                    $fuelType = strtolower($vehicle->fuel_type ?? 'pertalite');
                    $maxQuota = 9999; // Motor tidak ada limit liter
                    
                    $usedToday = \App\Models\Transaction::where('vehicle_id', $vehicle->id)
                        ->whereDate('transacted_at', now()->toDateString())
                        ->sum('volume');
                        
                    $remainingQuota = max(0, $maxQuota - $usedToday);
                }

                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'registered_plate' => $vehicle ? $vehicle->plate_number : 'MOTOR TANPA QR',
                        'detected_plate' => $detectedClass,
                        'confidence' => $confidence,
                        'is_match' => $isMatch,
                        'annotated_image' => $aiResult['data']['media_url'] ?? null,
                        'vehicle_type' => 'motor',
                        'fuel_type' => $fuelType,
                        'remaining_quota' => $remainingQuota,
                        'max_quota' => $maxQuota
                    ]
                ]);
            }
            
            Log::error('Motor AI Service Error: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('Motor AI Service Connection Failed: ' . $e->getMessage());
        }

        @unlink($absPath);

        return response()->json([
            'status' => 'error',
            'message' => 'Gagal terhubung ke layanan AI Klasifikasi Motor'
        ], 500);
    }

    /**
     * Check remaining daily quota for a vehicle
     */
    public function checkQuota(Request $request)
    {
        $vehicleId = $request->vehicle_id;
        $fuelType = $request->fuel_type ?? 'pertalite';

        if (!$vehicleId) {
            return response()->json(['remaining_quota' => 20, 'max_quota' => 20, 'used_today' => 0]);
        }

        $vehicle = Vehicle::find($vehicleId);
        if (!$vehicle) {
            return response()->json(['error' => 'Kendaraan tidak ditemukan'], 404);
        }

        // Use the requested fuel type or fallback to the vehicle's registered fuel type
        $fuelType = strtolower($request->fuel_type ?? $vehicle->fuel_type ?? 'pertalite');

        $isMotor = ($vehicle->vehicle_type === 'motor');
        if ($isMotor) {
            return response()->json(['remaining_quota' => 9999, 'max_quota' => 9999, 'used_today' => 0]);
        }

        if ($fuelType === 'solar' || $fuelType === 'biosolar') {
            $maxQuota = match($vehicle->vehicle_type) {
                'angkutan_umum' => 80,
                'angkutan_barang' => 200,
                default => 50, // mobil_pribadi solar max is 50L
            };
        } else {
            $maxQuota = 50; // pertalite max 50L (for cars)
        }

        $usedToday = \App\Models\Transaction::where('vehicle_id', $vehicleId)
            ->whereDate('transacted_at', now()->toDateString())
            ->sum('volume');

        return response()->json([
            'remaining_quota' => max(0, $maxQuota - $usedToday),
            'max_quota' => $maxQuota,
            'used_today' => $usedToday,
        ]);
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
        $vehicleId = $request->vehicle_id;
        
        $maxQuota = 20; // Default limit for Non-QR (20L)
        $isMotor = false;
        $fuelType = strtolower($request->fuel_type ?? 'pertalite');

        if ($vehicleId) {
            $vehicle = Vehicle::find($vehicleId);
            $fuelType = strtolower($request->fuel_type ?? $vehicle->fuel_type ?? 'pertalite');
            $isMotor = ($vehicle->vehicle_type === 'motor');
            
            if ($isMotor) {
                $maxQuota = 9999; // Motor tidak ada limit liter
            } else if ($fuelType === 'solar' || $fuelType === 'biosolar') {
                $maxQuota = match($vehicle->vehicle_type) {
                    'angkutan_umum' => 80,
                    'angkutan_barang' => 200, // dump truck dll
                    default => 50, // mobil_pribadi solar max 50L
                };
            } else {
                $maxQuota = 50; // pertalite max 50L
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

            if (!$request->is_motor && (empty($request->plate_result) || $request->plate_result === '-' || strpos(strtoupper($request->plate_result), 'TANPA QR') !== false)) {
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

            if (!$request->is_motor && ($usedToday + $volume > $maxQuota)) {
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

        // Map Mobile App string statuses to Database ENUM values
        $qrResultMap = [
            'match' => 'qr_match',
            'mismatch' => 'qr_not_match',
            'no_qr' => 'manual_review',
        ];
        $dbQrResult = $qrResultMap[$request->qr_result] ?? 'manual_review';

        $dbStatus = $request->is_override ? 'manual_review' : ($request->qr_result === 'match' ? 'validated' : 'pending');

        $transaction = \App\Models\Transaction::create([
            'vehicle_id' => $vehicleId,
            'spbu_id' => $spbuId,
            'operator_id' => $operatorId,
            'fuel_type' => $fuelType,
            'volume' => $volume,
            'qr_result' => $dbQrResult,
            'plate_result' => $request->plate_result,
            'plate_confidence' => $request->plate_confidence,
            'transaction_status' => $dbStatus,
            'transacted_at' => now(),
        ]);

        // Generate SHA-256 hash dan simpan langsung ke DB sebagai blockchain_reference
        // Format: txId|plate|fuelType|volume|spbuCode (sama dengan yang dicek di frontend Blockchain.tsx)
        $spbuCode = $operator ? ($operator->spbu->code ?? '14.201.001') : '14.201.001';
        $plateResult = $transaction->plate_result ?? '';
        $dataString = "{$transaction->id}|{$plateResult}|{$transaction->fuel_type}|{$transaction->volume}|{$spbuCode}";
        $dataHash = hash('sha256', $dataString);

        // Simpan hash langsung ke DB (tanpa perlu hardhat)
        $transaction->update(['blockchain_reference' => $dataHash]);

        return response()->json([
            'status' => 'success',
            'message' => 'Transaksi berhasil dicatat dan kuota dipotong.',
            'data' => $transaction
        ], 201);
    }
}
