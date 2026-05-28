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
    mkdir($storagePath . '/bootstrap', 0777, true);
    mkdir($storagePath . '/bootstrap/cache', 0777, true);
}

// Override Laravel's storage path
$_ENV['APP_STORAGE'] = $storagePath;
putenv("APP_STORAGE={$storagePath}");
$_ENV['VIEW_COMPILED_PATH'] = $storagePath . '/framework/views';
putenv("VIEW_COMPILED_PATH={$storagePath}/framework/views");

// Override Bootstrap Cache Paths
$_ENV['APP_PACKAGES_CACHE'] = $storagePath . '/bootstrap/cache/packages.php';
putenv("APP_PACKAGES_CACHE={$storagePath}/bootstrap/cache/packages.php");
$_ENV['APP_SERVICES_CACHE'] = $storagePath . '/bootstrap/cache/services.php';
putenv("APP_SERVICES_CACHE={$storagePath}/bootstrap/cache/services.php");
$_ENV['APP_CONFIG_CACHE'] = $storagePath . '/bootstrap/cache/config.php';
putenv("APP_CONFIG_CACHE={$storagePath}/bootstrap/cache/config.php");
$_ENV['APP_ROUTES_CACHE'] = $storagePath . '/bootstrap/cache/routes.php';
putenv("APP_ROUTES_CACHE={$storagePath}/bootstrap/cache/routes.php");
$_ENV['APP_EVENTS_CACHE'] = $storagePath . '/bootstrap/cache/events.php';
putenv("APP_EVENTS_CACHE={$storagePath}/bootstrap/cache/events.php");

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
