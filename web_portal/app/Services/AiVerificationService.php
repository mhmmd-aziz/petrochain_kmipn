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
            $response = Http::timeout(5)->attach(
                'stnk_image', file_get_contents($stnkPath), basename($stnkPath)
            )->attach(
                'car_image', file_get_contents($carPath), basename($carPath)
            )->post('http://127.0.0.1:5002/api/extract');

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
     * Simulated AI results for Demo Mode
     */
    private function getDemoModeResult($stnkPath)
    {
        // Simple deterministic mock based on filename length or random
        $isMatch = (strlen(basename($stnkPath)) % 2 == 0); // Mock logic
        
        // For consistent demo, let's just make it always return a mock plate
        // or a specific pattern based on the fact that this is demo mode.
        $plate = 'BL 1234 DEMO';
        $carPlate = $isMatch ? $plate : 'BL 5678 FAKE';
        
        return [
            'stnk_plate' => $plate,
            'stnk_confidence' => 0.95,
            'car_plate' => $carPlate,
            'car_confidence' => 0.88,
            'conclusion' => $isMatch ? 'match' : 'mismatch',
            'is_demo_mode' => true,
        ];
    }
}
