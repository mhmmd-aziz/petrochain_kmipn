<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OcrResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'registration_application_id',
        'source_type',
        'extracted_plate',
        'confidence',
        'raw_result',
        'normalized_result',
        'comparison_result',
        'engine',
        'model_version',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'confidence' => 'float',
            'processed_at' => 'datetime',
        ];
    }

    public function registrationApplication()
    {
        return $this->belongsTo(RegistrationApplication::class);
    }
}
