<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlockchainRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'block_reference',
        'transaction_hash',
        'previous_hash',
        'digital_signature',
        'payload_hash',
        'payload_data',
        'status',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'payload_data' => 'array',
            'recorded_at' => 'datetime',
        ];
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
