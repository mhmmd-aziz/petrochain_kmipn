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
            'vehicle_id' => 'required|exists:vehicles,id',
            'vehicle_image' => 'required|image|max:5120',
        ]);

        $vehicle = Vehicle::findOrFail($request->vehicle_id);
        
        // Save image temporarily
        $imagePath = $request->file('vehicle_image')->store('temp', 'public');
        $absPath = storage_path('app/public/' . $imagePath);

        // Call OCR SPBU Service (Port 5003) - Assuming it has /detect endpoint
        try {
            $response = Http::timeout(15)->attach(
                'file', file_get_contents($absPath), basename($absPath)
            )->post('http://127.0.0.1:5003/detect');

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

                    if ($detectedPlate) {
                        $cleanDetected = str_replace(' ', '', strtoupper($detectedPlate));
                        $cleanRegistered = str_replace(' ', '', strtoupper($vehicle->plate_number));
                        
                        if ($cleanDetected === $cleanRegistered || strpos($cleanDetected, $cleanRegistered) !== false || strpos($cleanRegistered, $cleanDetected) !== false) {
                            $isMatch = true;
                        }
                    }
                }

                // Delete temp file
                @unlink($absPath);

                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'registered_plate' => $vehicle->plate_number,
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
}
