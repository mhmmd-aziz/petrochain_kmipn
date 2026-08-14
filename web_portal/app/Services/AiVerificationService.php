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
            $response = Http::timeout(15)->attach(
                'stnk_image', file_get_contents($stnkPath), basename($stnkPath)
            )->attach(
                'car_image', file_get_contents($carPath), basename($carPath)
            )->post('http://127.0.0.1:5002/api/extract');

            if ($response->successful()) {
                return $response->json('data');
            }
            
            Log::error('AI Service Error: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('AI Service Connection Failed: ' . $e->getMessage());
            return null;
        }
    }
}
