<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleDetection extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'model_name',
        'model_version',
        'detected_class',
        'confidence',
        'engine_capacity_cc',
        'eligibility_result',
        'raw_result',
    ];

    protected function casts(): array
    {
        return [
            'confidence' => 'float',
            'raw_result' => 'array',
        ];
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
