<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

class BlockchainService
{
    /**
     * Record a transaction hash on the local Hardhat blockchain.
     */
    public function recordTransaction(string $txId, string $dataHash, string $spbuCode): bool
    {
        // Path to the blockchain directory relative to Laravel root
        $baseDir = base_path('../blockchain');
        // If we're on Windows, npx.cmd should be used, but Process usually resolves npx
        $script = "npx hardhat run scripts/record_tx.js --network localhost";
        
        $env = [
            'TX_ID' => $txId,
            'DATA_HASH' => $dataHash,
            'SPBU_CODE' => $spbuCode,
        ];

        try {
            $result = Process::path($baseDir)
                ->env($env)
                ->run($script);

            if ($result->successful()) {
                Log::info("Blockchain Success: " . $result->output());
                return true;
            } else {
                Log::error("Blockchain Error: " . $result->errorOutput());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("Blockchain Exception: " . $e->getMessage());
            return false;
        }
    }
}
