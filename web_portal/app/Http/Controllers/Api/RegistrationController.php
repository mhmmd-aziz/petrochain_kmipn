<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vehicle;
use App\Models\RegistrationApplication;

class RegistrationController extends Controller
{
    /**
     * Get list of vehicles owned by the authenticated user
     */
    public function myVehicles(Request $request)
    {
        $user = $request->user();
        
        // Eager load the active registration application to get the status
        $vehicles = Vehicle::where('user_id', $user->id)
            ->with(['registrationApplications' => function($query) {
                $query->latest()->limit(1);
            }])
            ->get();

        $formatted = $vehicles->map(function ($vehicle) {
            $latestApp = $vehicle->registrationApplications->first();
            
            return [
                'id' => $vehicle->id,
                'plate_number' => $vehicle->plate_number,
                'vehicle_type' => $vehicle->vehicle_type,
                'fuel_type' => $vehicle->fuel_type,
                'brand' => $vehicle->brand,
                'model' => $vehicle->model,
                'qr_code_url' => $vehicle->qr_code_token ? "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($vehicle->qr_code_token) : null,
                'car_image_url' => ($latestApp && $latestApp->vehicle_photo) ? asset('storage/' . $latestApp->vehicle_photo) : null,
                'registration_status' => $latestApp ? $latestApp->status : 'unregistered',
                'submitted_at' => $latestApp ? $latestApp->submitted_at : null,
                'admin_notes' => $latestApp ? $latestApp->admin_notes : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formatted
        ]);
    }

    /**
     * Submit a new registration (Upload STNK & Car Photo)
     */
    public function registerVehicle(Request $request)
    {
        \Log::info("Mobile Registration Payload: ", $request->except(['stnk_image', 'car_image']));

        $request->validate([
            'plate_number' => 'required|string|max:20',
            'vehicle_type' => 'required|string|in:mobil_pribadi,angkutan_umum,angkutan_barang',
            'brand' => 'required|string|max:50',
            'model' => 'required|string|max:50',
            'engine_capacity_cc' => 'required|integer|min:0|max:20000',
            'fuel_type' => 'required|string|max:30',
            'stnk_image' => 'required|image|max:15360', // Max 15MB
            'car_image' => 'required|image|max:15360', // Max 15MB
        ]);

        $user = $request->user();

        // Check if vehicle exists for this user, if not create it
        $vehicle = Vehicle::firstOrCreate(
            ['plate_number' => $request->plate_number, 'user_id' => $user->id],
            [
                'vehicle_type' => $request->vehicle_type,
                'brand' => $request->brand,
                'model' => $request->model,
                'engine_capacity_cc' => $request->engine_capacity_cc,
                'fuel_type' => $request->fuel_type,
                'registration_status' => 'pending',
            ]
        );

        // Always update the vehicle's details with the latest user input in case they are re-submitting
        if (!$vehicle->wasRecentlyCreated) {
            $vehicle->update([
                'vehicle_type' => $request->vehicle_type,
                'brand' => $request->brand,
                'model' => $request->model,
                'engine_capacity_cc' => $request->engine_capacity_cc,
                'fuel_type' => $request->fuel_type,
            ]);
        }

        // Store images
        $stnkPath = $request->file('stnk_image')->store('registrations', 'public');
        $photoPath = $request->file('car_image')->store('registrations', 'public');

        // Create Registration Application
        $application = RegistrationApplication::create([
            'vehicle_id' => $vehicle->id,
            'user_id' => $user->id,
            'stnk_file' => $stnkPath,
            'vehicle_photo' => $photoPath,
            'status' => 'pending_review',
            'submitted_at' => now(),
        ]);

        // Call AI Microservice
        $aiService = new \App\Services\AiVerificationService();
        $absStnkPath = storage_path('app/public/' . $stnkPath);
        $absCarPath = storage_path('app/public/' . $photoPath);
        
        $aiResult = $aiService->extractPlates($absStnkPath, $absCarPath);

        if ($aiResult) {
            // Check if document validation failed
            $documentValid = $aiResult['document_valid'] ?? true;
            $validationMessage = $aiResult['validation_message'] ?? null;
            $documentType = $aiResult['document_type'] ?? 'unknown';

            if (!$documentValid) {
                // Document is invalid — flag the application with a note but keep it pending for human review
                $application->update([
                    'status' => 'pending_review',
                    'admin_notes' => '[AI WARNING] ' . $validationMessage,
                ]);

                // Save the OCR record with low_confidence/mismatch to show in dashboard
                \App\Models\OcrResult::create([
                    'registration_application_id' => $application->id,
                    'source_type' => 'stnk',
                    'extracted_plate' => null,
                    'confidence' => 0.0,
                    'normalized_result' => 'DOKUMEN_TIDAK_VALID',
                    'comparison_result' => 'low_confidence',
                    'engine' => 'easyocr',
                    'processed_at' => now(),
                ]);
                
                \App\Models\OcrResult::create([
                    'registration_application_id' => $application->id,
                    'source_type' => 'vehicle_photo',
                    'extracted_plate' => null,
                    'confidence' => 0.0,
                    'normalized_result' => 'DOKUMEN_TIDAK_VALID',
                    'comparison_result' => 'low_confidence',
                    'engine' => 'yolo+easyocr',
                    'processed_at' => now(),
                ]);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Registration submitted successfully (with AI warning)',
                    'data' => [
                        'application_id' => $application->id,
                        'vehicle_id' => $vehicle->id,
                    ]
                ]);
            }

            // Document is valid — save OCR results normally
            $detectedCc = $aiResult['stnk_cc'] ?? null;
            $isWarning = $aiResult['is_warning'] ?? false;
            
            if ($isWarning && !empty($aiResult['validation_message'])) {
                $docWarning = "[AI WARNING] " . $aiResult['validation_message'];
                $existingNotes = $application->admin_notes;
                
                $application->update([
                    'admin_notes' => $existingNotes ? $existingNotes . "\n" . $docWarning : $docWarning
                ]);
            }
            
            \App\Models\OcrResult::create([
                'registration_application_id' => $application->id,
                'source_type' => 'stnk',
                'extracted_plate' => $aiResult['stnk_plate'],
                'confidence' => $aiResult['stnk_confidence'],
                // Store both plate, CC, and document type in normalized_result so frontend can parse it
                'normalized_result' => $aiResult['stnk_plate'] 
                    . ($detectedCc ? ' | ' . $detectedCc . ' CC' : '')
                    . (isset($aiResult['document_type']) ? ' | DOC:' . $aiResult['document_type'] : ''),
                'comparison_result' => $aiResult['conclusion'],
                'engine' => 'easyocr',
                'processed_at' => now(),
            ]);

            \App\Models\OcrResult::create([
                'registration_application_id' => $application->id,
                'source_type' => 'vehicle_photo',
                'extracted_plate' => $aiResult['car_plate'],
                'confidence' => $aiResult['car_confidence'],
                'normalized_result' => $aiResult['car_plate'] . (isset($aiResult['car_detected_type']) ? ' | CAR:' . $aiResult['car_detected_type'] : ''),
                'comparison_result' => $aiResult['conclusion'],
                'engine' => 'yolo+easyocr',
                'processed_at' => now(),
            ]);
            
            // Check if it's a motorcycle based on input or OCR detection
            $documentType = $aiResult['document_type'] ?? 'unknown';
            $isMotorcycle = $request->vehicle_type === 'motorcycle' || 
                            str_contains($documentType, 'motorcycle') || 
                            (isset($aiResult['car_detected_type']) && $aiResult['car_detected_type'] === 'motorcycle');

            if ($isMotorcycle) {
                $motorClassResult = $aiService->classifyMotorcycle($absCarPath);
                
                if ($motorClassResult) {
                    $detectedClass = $motorClassResult['detected_class'] ?? 'unknown';
                    $eligibility = $motorClassResult['eligibility_result'] ?? 'UNKNOWN';
                    
                    if ($eligibility === 'NOT_ELIGIBLE') {
                        $motorWarning = "[AI WARNING] YOLO mendeteksi kendaraan fisik sebagai motor OVER 250cc (" . strtoupper($detectedClass) . "). Mohon tolak pengajuan ini jika bukan subsidi.";
                        $existingNotes = $application->admin_notes;
                        $application->update([
                            'admin_notes' => $existingNotes ? $existingNotes . "\n" . $motorWarning : $motorWarning
                        ]);
                    }
                }
            }
            
            // Do NOT overwrite $vehicle->engine_capacity_cc with the AI's detected CC!
            // The AI's detected CC is safely saved in the OcrResult table, while $vehicle->engine_capacity_cc 
            // should strictly represent the USER'S INPUT from the mobile app.
            $detectedCc = $aiResult['stnk_cc'] ?? null;
            
            // Check Government Rule: Subsidized fuel only for <= 1400 CC (PERTALITE ONLY)
            $ccToValidate = $detectedCc ?: $vehicle->engine_capacity_cc;
            if ($vehicle->fuel_type === 'pertalite' && $ccToValidate && intval($ccToValidate) > 1400) {
                $ccWarning = "[AI WARNING] Kapasitas mesin " . $ccToValidate . " CC melebihi batas regulasi Pertalite (maks 1400 CC). Mohon tolak pengajuan ini.";
                $existingNotes = $application->admin_notes;
                
                $application->update([
                    'admin_notes' => $existingNotes ? $existingNotes . "\n" . $ccWarning : $ccWarning
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Registration submitted successfully',
            'data' => [
                'application_id' => $application->id,
                'vehicle_id' => $vehicle->id,
            ]
        ]);
    }
}
