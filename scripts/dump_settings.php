<?php
require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';

// Boot the framework enough to use DB
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$rows = Illuminate\Support\Facades\DB::table('settings')->get();

foreach ($rows as $r) {
    echo "$r->id | $r->group | $r->key = $r->value\n";
}

if ($rows->isEmpty()) {
    echo "(no rows)\n";
}
