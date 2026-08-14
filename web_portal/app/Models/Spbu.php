<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Spbu extends Model
{
    use HasFactory;

    protected $table = 'spbu';

    protected $fillable = [
        'code',
        'name',
        'address',
        'city',
        'province',
        'latitude',
        'longitude',
        'status',
    ];

    public function operators()
    {
        return $this->hasMany(Operator::class, 'spbu_id');
    }

    public function fuelStocks()
    {
        return $this->hasMany(FuelStock::class, 'spbu_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'spbu_id');
    }
}
