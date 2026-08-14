<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Operator extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'spbu_id',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function spbu()
    {
        return $this->belongsTo(Spbu::class, 'spbu_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'operator_id');
    }
}
