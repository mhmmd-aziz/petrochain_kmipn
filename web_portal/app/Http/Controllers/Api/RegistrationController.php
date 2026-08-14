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
                'brand' => $vehicle->brand,
                'model' => $vehicle->model,
                'qr_code_url' => $vehicle->qr_code ? asset('storage/qrcodes/' . $vehicle->qr_code) : null,
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
        $request->validate([
            'plate_number' => 'required|string|max:20',
            'vehicle_type' => 'required|string|in:car,motorcycle',
            'brand' => 'required|string|max:50',
            'model' => 'required|string|max:50',
            'stnk_image' => 'required|image|max:5120', // Max 5MB
            'car_image' => 'required|image|max:5120',
        ]);

        $user = $request->user();

        // Check if vehicle exists for this user, if not create it
        $vehicle = Vehicle::firstOrCreate(
            ['plate_number' => $request->plate_number, 'user_id' => $user->id],
            [
                'vehicle_type' => $request->vehicle_type,
                'brand' => $request->brand,
                'model' => $request->model,
                'registration_status' => 'pending',
            ]
        );

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
            \App\Models\OcrResult::create([
                'registration_application_id' => $application->id,
                'source_type' => 'stnk',
                'extracted_plate' => $aiResult['stnk_plate'],
                'confidence' => $aiResult['stnk_confidence'],
                'normalized_result' => $aiResult['stnk_plate'],
                'comparison_result' => $aiResult['conclusion'],
                'engine' => 'easyocr',
                'processed_at' => now(),
            ]);

            \App\Models\OcrResult::create([
                'registration_application_id' => $application->id,
                'source_type' => 'vehicle_photo',
                'extracted_plate' => $aiResult['car_plate'],
                'confidence' => $aiResult['car_confidence'],
                'normalized_result' => $aiResult['car_plate'],
                'comparison_result' => $aiResult['conclusion'],
                'engine' => 'yolo+easyocr',
                'processed_at' => now(),
            ]);
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
