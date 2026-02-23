<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // Determine if the user is attempting to log in with username or NIS
        $loginField = 'username';
        $loginValue = $this->input('username');
        
        // Check if the input matches an NIS
        $user = \App\Models\User::where('nis', $loginValue)->first();
        if ($user) {
            $loginField = 'nis';
        }

        // Attempt authentication with the determined field
        if (! Auth::attempt([$loginField => $loginValue, 'password' => $this->input('password')], $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'username' => trans('auth.failed'),
            ]);
        }

        // Check if user is approved (only for students, admin is always approved)
        $authenticatedUser = Auth::user();
        if ($authenticatedUser->role === 'student' && !$authenticatedUser->is_approved) {
            Auth::logout();
            
            throw ValidationException::withMessages([
                'username' => 'Your account is pending admin approval. Please wait until an administrator approves your registration.',
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'username' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    // Kept this single version at the bottom
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->input('username')).'|'.$this->ip());
    }
}
