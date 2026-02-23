<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PendingRequest extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'data',
        'status',
        'reason',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
