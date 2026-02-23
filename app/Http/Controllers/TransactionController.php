<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    // Function to borrow a book
    public function store(Request $request, $bookId)
    {
        // Allow the date to be strictly "after now"
        $request->validate([
            'return_date' => 'required|date|after_or_equal:now', 
        ]);

        Transaction::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'book_id' => $bookId,
            'tanggal_pinjam' => now(),
            'tanggal_kembali' => $request->return_date,
            'status' => 'pinjam',
        ]);

        return redirect()->back();
    }
}