<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'spbu_id',
        'operator_id',
        'fuel_type',
        'volume',
        'original_volume',
        'qr_result',
        'plate_result',
        'plate_confidence',
        'yolo_result',
        'yolo_confidence',
        'transaction_status',
        'blockchain_reference',
        'transacted_at',
    ];

    protected function casts(): array
    {
        return [
            'volume' => 'float',
            'plate_confidence' => 'float',
            'yolo_confidence' => 'float',
            'transacted_at' => 'datetime',
        ];
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function spbu()
    {
        return $this->belongsTo(Spbu::class, 'spbu_id');
    }

    public function operator()
    {
        return $this->belongsTo(Operator::class, 'operator_id');
    }

    public function vehicleDetection()
    {
        return $this->hasOne(VehicleDetection::class);
    }

    public function blockchainRecord()
    {
        return $this->hasOne(BlockchainRecord::class);
    }
}
