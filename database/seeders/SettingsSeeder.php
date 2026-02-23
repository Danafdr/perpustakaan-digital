<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Password Settings
            [
                'key' => 'password_min_length',
                'value' => '8',
                'type' => 'integer',
                'group' => 'security',
            ],
            [
                'key' => 'password_require_uppercase',
                'value' => '1', // true
                'type' => 'boolean',
                'group' => 'security',
            ],
            [
                'key' => 'password_require_numeric',
                'value' => '1', // true
                'type' => 'boolean',
                'group' => 'security',
            ],
            [
                'key' => 'password_require_special',
                'value' => '0', // false
                'type' => 'boolean',
                'group' => 'security',
            ],
            
            // ID Card Settings
            [
                'key' => 'id_card_length',
                'value' => '10',
                'type' => 'integer',
                'group' => 'system',
            ],
            [
                'key' => 'id_card_allow_alpha',
                'value' => '0', // false
                'type' => 'boolean',
                'group' => 'system',
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->updateOrInsert(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
