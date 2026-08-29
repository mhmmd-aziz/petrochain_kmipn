<?php

namespace App\Http\Controllers;

use App\Models\RegistrationApplication;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class UserRegistrationController extends Controller
{
    public function index(Request $request)
    {
        $applications = RegistrationApplication::with('vehicle')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return Inertia::render('Registration/Index', [
            'applications' => $applications,
        ]);
    }

    public function create()
    {
        return Inertia::render('Registration/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'plate_number' => 'required|string|max:20',
            'vehicle_type' => 'required|in:mobil_pribadi,angkutan_umum,angkutan_barang',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'engine_capacity_cc' => 'nullable|integer',
            'stnk_file' => 'required|image|max:5120', // Max 5MB
            'vehicle_photo' => 'required|image|max:5120',
        ]);

        // 1. Handle File Uploads
        $stnkPath = $request->file('stnk_file')->store('registrations/stnk', 'public');
        $photoPath = $request->file('vehicle_photo')->store('registrations/vehicle_photo', 'public');

        // 2. Create Vehicle Record
        $vehicle = Vehicle::create([
            'user_id' => $request->user()->id,
            'plate_number' => strtoupper(str_replace(' ', '', $request->plate_number)),
            'vehicle_type' => $request->vehicle_type,
            'brand' => $request->brand,
            'model' => $request->model,
            'engine_capacity_cc' => $request->engine_capacity_cc,
            'registration_status' => 'pending',
        ]);

        // 3. Create Registration Application
        $application = RegistrationApplication::create([
            'vehicle_id' => $vehicle->id,
            'user_id' => $request->user()->id,
            'stnk_file' => $stnkPath,
            'vehicle_photo' => $photoPath,
            'status' => 'pending_review',
            'submitted_at' => now(),
        ]);

        // 4. Call AI Microservice
        $aiService = new \App\Services\AiVerificationService();
        $absStnkPath = storage_path('app/public/' . $stnkPath);
        $absCarPath = storage_path('app/public/' . $photoPath);
        
        $aiResult = $aiService->extractPlates($absStnkPath, $absCarPath);

        if ($aiResult) {
            // Cek Duplikasi Berbasis OCR STNK
            $ocrPlate = strtoupper(str_replace(' ', '', $aiResult['stnk_plate'] ?? ''));
            if (!empty($ocrPlate)) {
                $isDuplicate = \App\Models\Vehicle::where('plate_number', $ocrPlate)
                    ->where('registration_status', 'approved')
                    ->exists();

                if ($isDuplicate) {
                    $application->update([
                        'admin_notes' => '[AI WARNING] 🚨 DUPLIKASI TERDETEKSI: Pelat dari dokumen STNK ini sudah terdaftar dan aktif atas nama pengguna lain. Indikasi pemalsuan dokumen atau STNK ganda.'
                    ]);
                }
            }

            // Simpan hasil STNK
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

            // Simpan hasil Foto Kendaraan
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

        return redirect()->route('registrations.index')->with('success', 'Pendaftaran berhasil disubmit dan menunggu review.');
    }
}
