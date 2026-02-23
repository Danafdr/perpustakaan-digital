<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'nis' => [
                'sometimes', // Only present for students
                'nullable',
                Rule::unique(User::class)->ignore($this->user()->id),
                function ($attribute, $value, $fail) {
                    // Only validate if value is present
                    if (empty($value)) return;

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
        ];
    }
}
