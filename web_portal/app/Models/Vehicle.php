<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plate_number',
        'vehicle_type',
        'brand',
        'model',
        'color',
        'year',
        'engine_capacity_cc',
        'fuel_type',
        'registration_status',
        'qr_code_path',
        'qr_code_token',
        'qr_generated_at',
    ];

    protected function casts(): array
    {
        return [
            'qr_generated_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function registrationApplications()
    {
        return $this->hasMany(RegistrationApplication::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
