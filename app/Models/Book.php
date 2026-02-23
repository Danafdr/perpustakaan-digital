<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    // This tells Laravel: "It is okay to save data into these columns"
    protected $fillable = [
        'kode_buku',
        'judul_buku',
        'pengarang',
        'penerbit',
        'tahun',
    ];

    // Add this inside your Book class
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}