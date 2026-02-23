<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\TransactionController;

// --- AUTHENTICATED ROUTES (Admin & Student) ---
Route::middleware(['auth'])->group(function () {
    
    // 1. Admin Dashboard Route
    Route::get('/admin/dashboard', [AdminController::class, 'index'])
        ->name('admin.dashboard'); // Name MUST be 'admin.dashboard'
    
    // 2. Book Management
    Route::post('/admin/books', [AdminController::class, 'store'])->name('books.store');
    Route::put('/admin/books/{id}', [AdminController::class, 'update'])->name('books.update');
    Route::delete('/admin/books/{id}', [AdminController::class, 'destroyBook'])->name('books.destroy');

    // 3. Student Borrowing
    Route::post('/transactions/{book_id}', [TransactionController::class, 'store'])->name('transactions.store');

    // 4. Admin Return Confirmation
    Route::post('/admin/transactions/{id}/return', [AdminController::class, 'returnBook'])->name('transactions.return');

    // 5. Member Management
    Route::put('/admin/members/{id}', [AdminController::class, 'updateMember'])->name('members.update');
    Route::delete('/admin/members/{id}', [AdminController::class, 'destroyMember'])->name('members.destroy');
    Route::post('/admin/members/{id}/approve', [AdminController::class, 'approveUser'])->name('members.approve');
    Route::post('/admin/members/{id}/reject', [AdminController::class, 'rejectUser'])->name('members.reject');
    Route::put('/admin/members/{id}/password', [AdminController::class, 'updateUserPassword'])->name('members.password.update');
    Route::get('/admin/members/{id}/requests', [AdminController::class, 'memberRequests'])->name('members.requests');

    // 6. Request Management
    Route::post('/admin/requests/{id}/approve', [AdminController::class, 'approveRequest'])->name('requests.approve');
    Route::post('/admin/requests/{id}/reject', [AdminController::class, 'rejectRequest'])->name('requests.reject');

    // 7. System Settings
    Route::get('/admin/settings', [AdminController::class, 'settings'])->name('admin.settings');
    Route::post('/admin/settings', [AdminController::class, 'updateSettings'])->name('admin.settings.update');
});

// --- PUBLIC & DASHBOARD LOGIC ---

Route::get('/', function () {
    // If user is already logged in, redirect to their respective dashboard
    if (auth()->check()) {
        if (auth()->user()->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('student.dashboard');
    }

    // Filter Books for Guests (Same logic as Student Dashboard)
    $availableBooks = \App\Models\Book::whereDoesntHave('transactions', function ($query) {
        $query->where('status', 'pinjam');
    })->get();

    return Inertia::render('Guest_Dashboard', [
        'books' => $availableBooks
    ]);
});

// --- STUDENT DASHBOARD ---
Route::get('/dashboard', function () {
    
    // Safety Check: If an Admin accidentally hits this URL, send them away
    if (auth()->user()->role === 'admin') {
        return redirect()->route('admin.dashboard');
    }

    // Filter Books for Students
    $availableBooks = \App\Models\Book::whereDoesntHave('transactions', function ($query) {
        $query->where('status', 'pinjam');
    })->get();

    // Get Active Transactions for the current student
    $activeTransactions = \App\Models\Transaction::with('book')
        ->where('user_id', auth()->id())
        ->where('status', 'pinjam')
        ->get();

    return Inertia::render('Student_Dashboard', [
        'books' => $availableBooks,
        'activeTransactions' => $activeTransactions
    ]);
})->middleware(['auth', 'verified'])->name('student.dashboard'); // Name MUST be 'student.dashboard'

// --- PROFILE ROUTES ---
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::get('/profile/requests', [ProfileController::class, 'indexRequests'])->name('profile.requests.index');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';