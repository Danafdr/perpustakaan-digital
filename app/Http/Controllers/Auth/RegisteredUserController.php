<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nis' => [
                'required', 
                'unique:'.User::class,
                function ($attribute, $value, $fail) {
                    $allowAlpha = \App\Services\SystemSetting::get('id_card_allow_alpha', false);
                    $length = \App\Services\SystemSetting::get('id_card_length', 10);
                    
                    if (!$allowAlpha && !is_numeric($value)) {
                        $fail('The '.$attribute.' must only contain numbers.');
                    }

                    if (strlen((string)$value) !== $length) {
                        $fail('The '.$attribute.' must be exactly '.$length.' characters.');
                    }
                }
            ],
            'date_of_birth' => 'required|date',
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::min(\App\Services\SystemSetting::get('password_min_length', 8))
                ->when(\App\Services\SystemSetting::get('password_require_uppercase', true), fn($p) => $p->mixedCase())
                ->when(\App\Services\SystemSetting::get('password_require_numeric', true), fn($p) => $p->letters()->numbers())
                ->when(\App\Services\SystemSetting::get('password_require_special', false), fn($p) => $p->symbols())
            ],
        ]);

        // Auto-generate username from name if not provided
        $username = strtolower(str_replace(' ', '', $request->name));
        
        // Check if username exists and append number if needed
        $baseUsername = $username;
        $counter = 1;
        while (User::where('username', $username)->exists()) {
            $username = $baseUsername . $counter;
            $counter++;
        }

        $user = User::create([
            'name' => $request->name,
            'username' => $username,
            'email' => $request->nis . '@library.local', // Create dummy email from NIS
            'nis' => $request->nis,
            'date_of_birth' => $request->date_of_birth,
            'password' => Hash::make($request->password),
            'role' => 'student', // Auto-assign student role
            'is_approved' => false, // Require admin approval
        ]);

        event(new Registered($user));

        // Don't auto-login - redirect to login with message
        return redirect(route('login'))->with('success', 'Registration successful! Please wait for admin approval before you can log in.');
    }
}
