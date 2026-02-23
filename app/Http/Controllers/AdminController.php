<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

use App\Services\SystemSetting;

class AdminController extends Controller
{
    // 1. Dashboard Page
    public function index()
    {
        if (auth()->user()->role !== 'admin') {
            return redirect()->route('student.dashboard');
        }

        // Fetch transactions with the User and Book details attached
        $transactions = Transaction::with(['user', 'book'])->latest()->get();
        
        // Fetch all members (Admins + Students)
        $members = User::latest()->get();

        // Fetch pending requests
        $pendingRequests = \App\Models\PendingRequest::with('user')
            ->where('status', 'pending')
            ->latest()
            ->get();

        // Change 'admin_dashboard' to 'Admin_Dashboard'
        return Inertia::render('Admin_Dashboard', [
            'totalBooks' => Book::count(),
            'totalMembers' => User::count(),
            'totalTransactions' => Transaction::count(),
            'books' => Book::all(),
            'transactions' => $transactions,
            'members' => $members,
            'pendingRequests' => $pendingRequests,
        ]);
    }

    // 2. Store a new book
    public function store(Request $request)
    {
        $validated = $request->validate([
            'judul_buku' => 'required|string|max:255',
            'pengarang' => 'required|string|max:255',
            'penerbit' => 'required|string|max:255',
            'tahun' => 'required|integer',
        ]);

        // Generate kode_buku manually mostly for demo 
        // (Assuming format B + 3 digits)
        $lastBook = Book::latest()->first();
        $nextId = $lastBook ? $lastBook->id + 1 : 1;
        $validated['kode_buku'] = 'B' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

        Book::create($validated);

        return redirect()->back()->with('success', 'Book added successfully.');
    }

    // 3. Update a book
    public function update(Request $request, $id)
    {
        $book = Book::findOrFail($id);

        $validated = $request->validate([
            'judul_buku' => 'required|string|max:255',
            'pengarang' => 'required|string|max:255',
            'penerbit' => 'required|string|max:255',
            'tahun' => 'required|integer',
        ]);

        $book->update($validated);

        return redirect()->back()->with('success', 'Book updated successfully.');
    }

    // 4. Delete a book
    public function destroyBook($id)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        $book = Book::findOrFail($id);
        
        // Check if book has active transactions (borrowed)
        $isBorrowed = Transaction::where('book_id', $id)
            ->where('status', 'pinjam')
            ->exists();
            
        if ($isBorrowed) {
            return redirect()->back()->with('error', 'Cannot delete book: Book is currently borrowed.');
        }

        // Delete all history of this book or just delete the book? 
        // Usually we keep history, but for simplicity let's cascade if set up in DB, 
        // or just delete the book if no active transactions.
        // Assuming transactions table has foreign key constraint or we leave history.
        // If we want to keep history but delete book, we might need soft deletes.
        // For now, standard delete.
        $book->delete();
        
        return redirect()->back()->with('success', 'Book deleted successfully.');
    }

    // 5. Return a book (Mark transaction as complete)
    public function returnBook($id)
    {
        $transaction = Transaction::find($id);
        
        $transaction->update([
            'status' => 'kembali',
        ]);

        return redirect()->back();
    }

    // 6. Update a member (student)
    public function updateMember(Request $request, $id)
    {
        $member = User::findOrFail($id);
        
        // Fetch system settings for ID validation
        $idLength = SystemSetting::get('id_card_length', 10);
        $allowAlpha = SystemSetting::get('id_card_allow_alpha', false);

        $nisRules = ['nullable', 'unique:users,nis,' . $id];

        if ($allowAlpha) {
            // If alpha is allowed, it's a string. Length is max length.
            $nisRules[] = 'alpha_num';
            $nisRules[] = 'max:' . $idLength;
        } else {
            // If alpha is NOT allowed, it's numeric.
            $nisRules[] = 'numeric';
            // Allow 1 to $idLength digits
            $nisRules[] = 'digits_between:1,' . $idLength;
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'nis' => $nisRules,
            'role' => 'required|in:admin,student', // Validate role
        ]);

        $member->update([
            'name' => $request->name,
            'email' => $request->email,
            'nis' => $request->nis,
            'role' => $request->role, // Update role
        ]);

        return redirect()->back()->with('success', 'Member updated successfully');
    }

    // 7. Delete a member (student)
    public function destroyMember($id)
    {
        $member = User::findOrFail($id);
        
        // Prevent deleting admins
        if ($member->role === 'admin') {
            return redirect()->back()->with('error', 'Cannot delete admin users');
        }
        
        // Delete related transactions first
        Transaction::where('user_id', $id)->delete();
        
        $member->delete();
        
        return redirect()->back()->with('success', 'Member deleted successfully');
    }

    // 8. Approve a pending user
    public function approveUser($id)
    {
        $user = User::findOrFail($id);
        
        $user->update([
            'is_approved' => true,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return redirect()->back()->with('success', 'User approved successfully!');
    }

    // 9. Reject/Delete a pending user
    public function rejectUser($id)
    {
        $user = User::findOrFail($id);
        
        // Only allow rejecting unapproved users
        if (!$user->is_approved) {
            $user->delete();
            return redirect()->back()->with('success', 'User rejected and removed.');
        }

        return redirect()->back()->with('error', 'Cannot reject an approved user.');
    }

    // 10. Update student password (admin only)
    public function updateUserPassword(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return redirect()->back()->with('success', 'Password updated successfully!');
    }

    // 11. Approve a request
    public function approveRequest($id)
    {
        $request = \App\Models\PendingRequest::with('user')->findOrFail($id);
        $user = $request->user;

        if ($request->type === 'update_profile') {
            $data = $request->data;
            if (isset($data['email']) && $data['email'] !== $user->email) {
                $user->email_verified_at = null;
            }
            $user->update($data);
        } elseif ($request->type === 'delete_account') {
             // Delete transactions first
             Transaction::where('user_id', $user->id)->delete();
             $user->delete();
        }

        $request->update(['status' => 'approved']);

        return redirect()->back()->with('success', 'Request approved successfully!');
    }

    // 12. Reject a request
    public function rejectRequest(Request $request, $id)
    {
        $pendingRequest = \App\Models\PendingRequest::findOrFail($id);
        
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);
        
        $pendingRequest->update([
            'status' => 'rejected',
            'reason' => $validated['reason'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Request rejected.');
    }


    // 13. View member requests history
    public function memberRequests($id)
    {
        $member = User::findOrFail($id);
        
        $requests = \App\Models\PendingRequest::where('user_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/MemberRequests', [
            'member' => $member,
            'requests' => $requests,
        ]);
    }

    // 14. Settings Page
    public function settings()
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        $settings = \App\Services\SystemSetting::getAll();

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
        ]);
    }

    // 15. Update Settings
    public function updateSettings(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        $data = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|exists:settings,key',
            'settings.*.value' => 'nullable', // Value can be anything
        ]);

        foreach ($data['settings'] as $item) {
            \App\Services\SystemSetting::set($item['key'], $item['value']);
        }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}