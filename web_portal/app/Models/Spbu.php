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
        'image_path',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        if ($this->image_path) {
            return asset('storage/' . $this->image_path);
        }
        return null;
    }

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
