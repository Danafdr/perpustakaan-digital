<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // 1. Create or Update ADMIN (preserves across migrations)
        \App\Models\User::updateOrCreate(
            ['username' => 'admin'], // Find by username
            [
                'name' => 'Administrator',
                'email' => 'admin@example.com',
                'role' => 'admin',
                'password' => bcrypt('password'),
                'is_approved' => true,
            ]
        );

        // 2. Create or Update STUDENT (preserves across migrations)
        \App\Models\User::updateOrCreate(
            ['username' => 'siswa'], // Find by username
            [
                'name' => 'Siswa Contoh',
                'email' => 'siswa@example.com',
                'role' => 'student',
                'nis' => '12345',
                'kelas' => 'XII RPL',
                'jurusan' => 'RPL',
                'password' => bcrypt('password'),
                'is_approved' => true,
            ]
        );
        
        // 3. Seed system settings
        $this->call(\Database\Seeders\SettingsSeeder::class);
    }
}