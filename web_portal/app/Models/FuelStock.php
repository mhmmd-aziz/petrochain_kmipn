<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FuelStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'spbu_id',
        'fuel_type',
        'status',
        'updated_by',
        'last_updated_at',
    ];

    protected function casts(): array
    {
        return [
            'last_updated_at' => 'datetime',
        ];
    }

    public function spbu()
    {
        return $this->belongsTo(Spbu::class, 'spbu_id');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
