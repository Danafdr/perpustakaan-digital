<?php

// Vercel is read-only except for /tmp.
// We must tell Laravel to use /tmp for all its storage/cache/views needs.
$storagePath = '/tmp/storage';

if (!is_dir($storagePath)) {
    mkdir($storagePath, 0777, true);
    mkdir($storagePath . '/app', 0777, true);
    mkdir($storagePath . '/framework', 0777, true);
    mkdir($storagePath . '/framework/cache', 0777, true);
    mkdir($storagePath . '/framework/sessions', 0777, true);
    mkdir($storagePath . '/framework/views', 0777, true);
    mkdir($storagePath . '/logs', 0777, true);
}

// Override Laravel's storage path
$_ENV['APP_STORAGE'] = $storagePath;
putenv("APP_STORAGE={$storagePath}");
$_ENV['VIEW_COMPILED_PATH'] = $storagePath . '/framework/views';
putenv("VIEW_COMPILED_PATH={$storagePath}/framework/views");

// Forward all Vercel requests to Laravel's standard entry point
try {
    define('LARAVEL_START', microtime(true));
    require __DIR__.'/../vendor/autoload.php';
    $app = require_once __DIR__.'/../bootstrap/app.php';
    $app->handleRequest(Illuminate\Http\Request::capture());
} catch (\Throwable $e) {
    echo "<h1>CRITICAL ERROR (Raw)</h1>";
    echo "<pre style='white-space: pre-wrap; word-wrap: break-word;'>" . (string) $e . "</pre>";
}
