<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiVerificationService
{
    /**
     * Call the Python OCR Microservice to extract plates from STNK and Vehicle Photo.
     * 
     * @param string $stnkPath The absolute path to the STNK image
     * @param string $carPath The absolute path to the Car image
     * @return array|null The AI extraction results
     */
    public function extractPlates($stnkPath, $carPath)
    {
        try {
            $response = Http::timeout(30)->attach(
                'stnk_image', file_get_contents($stnkPath), basename($stnkPath)
            )->attach(
                'car_image', file_get_contents($carPath), basename($carPath)
            )->post(env('AI_OCR_MOBILE_URL', 'http://127.0.0.1:5002') . '/api/extract');

            if ($response->successful()) {
                return $response->json('data');
            }
            
            Log::error('AI Service Error: ' . $response->body());
            // Fallback to demo mode if Python backend returns error
            return $this->getDemoModeResult($stnkPath);
            
        } catch (\Exception $e) {
            Log::error('AI Service Connection Failed: ' . $e->getMessage());
            // Fallback to demo mode if Python backend is offline
            return $this->getDemoModeResult($stnkPath);
        }
    }

    /**
     * Return error result instead of fake demo data
     */
    private function getDemoModeResult($stnkPath)
    {
        return [
            'stnk_plate' => 'ERROR: SERVICE OFFLINE',
            'stnk_confidence' => 0.0,
            'car_plate' => 'ERROR: SERVICE OFFLINE',
            'car_confidence' => 0.0,
            'stnk_cc' => null,
            'conclusion' => 'pending',
            'is_demo_mode' => true,
        ];
    }
}
