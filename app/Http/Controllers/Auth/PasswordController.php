<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class PasswordController extends Controller
{
    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::min(\App\Services\SystemSetting::get('password_min_length', 8))
                ->when(\App\Services\SystemSetting::get('password_require_uppercase', true), fn($p) => $p->mixedCase())
                ->when(\App\Services\SystemSetting::get('password_require_numeric', true), fn($p) => $p->letters()->numbers())
                ->when(\App\Services\SystemSetting::get('password_require_special', false), fn($p) => $p->symbols())
            ],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back();
    }
}
