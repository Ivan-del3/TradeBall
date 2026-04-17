<?php

use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Laravel y React se comunican correctamente',
        'timestamp' => now()->toISOString(),
    ]);
});