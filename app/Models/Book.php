<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode_buku',
        'judul_buku',
        'pengarang',
        'penerbit',
        'tahun',
        'isbn',
        'genre',
        'description',
        'cover_image_path',
        'file_path',
        'file_type',
        'max_concurrent_loans',
        'is_historical_archive',
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    public function holds()
    {
        return $this->hasMany(Hold::class);
    }
}