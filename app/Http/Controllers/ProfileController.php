<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        // Fetch user's profile requests
        $userRequests = \App\Models\PendingRequest::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'userRequests' => $userRequests,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        // If Admin, proceed as normal
        if ($request->user()->role === 'admin') {
            $request->user()->fill($request->validated());

            if ($request->user()->isDirty('email')) {
                $request->user()->email_verified_at = null;
            }

            $request->user()->save();

            return Redirect::route('profile.edit');
        }

        // If Student, create or update request
        \App\Models\PendingRequest::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'type' => 'update_profile',
                'status' => 'pending',
            ],
            [
                'data' => $request->validated(),
                'created_at' => now(), // Update timestamp to show it's recent
            ]
        );

        return Redirect::route('profile.edit')->with('status', 'request-sent');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // If Admin, proceed
        if ($user->role === 'admin') {
            Auth::logout();
            $user->delete();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return Redirect::to('/');
        }

        // If Student, create request
        \App\Models\PendingRequest::create([
            'user_id' => $user->id,
            'type' => 'delete_account',
            'data' => [],
            'status' => 'pending',
        ]);

        return Redirect::route('profile.edit')->with('status', 'deletion-request-sent');
    }
    /**
     * Display the user's request history.
     */
    public function indexRequests(Request $request): Response
    {
        $requests = \App\Models\PendingRequest::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Profile/Requests/Index', [
            'requests' => $requests,
        ]);
    }
}
