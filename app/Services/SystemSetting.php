<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SystemSetting
{
    /**
     * Get a setting value by key.
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function get(string $key, $default = null)
    {
        return Cache::rememberForever("setting.{$key}", function () use ($key, $default) {
            $setting = DB::table('settings')->where('key', $key)->first();
            
            if (!$setting) {
                return $default;
            }

            // Cast value based on type
            return match ($setting->type) {
                'integer' => (int) $setting->value,
                'boolean' => (bool) $setting->value,
                default => $setting->value,
            };
        });
    }

    /**
     * Set a setting value by key.
     *
     * @param string $key
     * @param mixed $value
     * @return void
     */
    public static function set(string $key, $value)
    {
        DB::table('settings')->updateOrInsert(
            ['key' => $key],
            ['value' => $value]
        );

        Cache::forget("setting.{$key}");
    }
    
    /**
     * Get all settings grouped by group.
     */
    public static function getAll()
    {
        return DB::table('settings')->get()->groupBy('group');
    }
}
