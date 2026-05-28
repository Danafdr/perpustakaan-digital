<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Bookmark;
use App\Models\Hold;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DigitalContentController extends Controller
{
    // 1. View Book Details & Reader UI
    public function read($id)
    {
        $book = Book::findOrFail($id);

        // Check if user has an active transaction for this book
        $hasAccess = Transaction::where('user_id', auth()->id())
            ->where('book_id', $id)
            ->where('status', 'pinjam')
            ->exists();

        if (!$hasAccess && auth()->user()->role !== 'admin') {
            return redirect()->route('student.dashboard')->with('error', 'You must borrow this book to read it.');
        }

        // Fetch bookmarks
        $bookmarks = Bookmark::where('user_id', auth()->id())
            ->where('book_id', $id)
            ->get();

        return Inertia::render('Reader/EbookReader', [
            'book' => $book,
            'bookmarks' => $bookmarks,
        ]);
    }

    // 2. Stream the actual file (DRM check)
    public function streamFile($id)
    {
        $book = Book::findOrFail($id);

        // Check access
        $hasAccess = Transaction::where('user_id', auth()->id())
            ->where('book_id', $id)
            ->where('status', 'pinjam')
            ->exists();

        if (!$hasAccess && auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized. Please borrow the book first.');
        }

        if (!$book->file_path || !Storage::disk('public')->exists($book->file_path)) {
            abort(404, 'File not found.');
        }

        return response()->file(storage_path('app/public/' . $book->file_path));
    }

    // 3. Save Bookmark
    public function saveBookmark(Request $request, $id)
    {
        $request->validate(['progress_marker' => 'required|string']);

        Bookmark::updateOrCreate(
            ['user_id' => auth()->id(), 'book_id' => $id],
            ['progress_marker' => $request->progress_marker]
        );

        return response()->json(['success' => true]);
    }

    // 4. Place a Hold
    public function placeHold($id)
    {
        $book = Book::findOrFail($id);

        // Check if already held
        $alreadyHeld = Hold::where('user_id', auth()->id())
            ->where('book_id', $id)
            ->where('status', 'pending')
            ->exists();

        if ($alreadyHeld) {
            return redirect()->back()->with('error', 'You are already on the waitlist for this book.');
        }

        Hold::create([
            'user_id' => auth()->id(),
            'book_id' => $id,
            'status' => 'pending'
        ]);

        return redirect()->back()->with('success', 'You have been added to the waitlist for ' . $book->judul_buku);
    }
}
