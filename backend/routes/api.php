<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ChatController;

// Públicas
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:20,1');
Route::post('/login',    [AuthController::class, 'login'])->middleware('throttle:20,1');

Route::get('/products',        [ProductController::class, 'index'])->middleware('throttle:60,1');
Route::get('/products/{id}',   [ProductController::class, 'show'])->middleware('throttle:60,1');
Route::get('/categories',      [ProductController::class, 'categories'])->middleware('throttle:30,1');

// Protegidas (necesitan el token Bearer en el header)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Productos
    Route::post('/products',        [ProductController::class, 'store']);
    Route::put('/products/{id}',    [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Favoritos
    Route::get('/favorites',                [FavoriteController::class, 'index']);
    Route::post('/favorites/{productId}',   [FavoriteController::class, 'store']);
    Route::delete('/favorites/{productId}', [FavoriteController::class, 'destroy']);

    // Perfil
    Route::post('/profile',        [ProfileController::class, 'update']);

    // Ventas
    Route::get('/sales', [SalesController::class, 'index']);

    // Compras
    Route::get('/purchases',                          [PurchaseController::class, 'index']);
    Route::post('/purchases',                         [PurchaseController::class, 'store'])->middleware('throttle:20,1');
    Route::post('/purchases/{id}/confirm',            [PurchaseController::class, 'confirm']);
    Route::post('/purchases/{id}/reject',             [PurchaseController::class, 'reject']);
    Route::post('/purchases/{id}/buyer-confirm',      [PurchaseController::class, 'buyerConfirm']);
    Route::post('/purchases/{id}/buyer-reject',       [PurchaseController::class, 'buyerReject']);
    Route::post('/purchases/{id}/confirm-return',     [PurchaseController::class, 'sellerConfirmReturn']);

    // Monedero
    Route::get('/wallet',           [WalletController::class, 'show']);
    Route::patch('/wallet/deposit',  [WalletController::class, 'deposit'])->middleware('throttle:20,1');
    Route::patch('/wallet/withdraw', [WalletController::class, 'withdraw'])->middleware('throttle:20,1');

    // Valoraciones
    Route::get('/reviews',        [ReviewController::class,   'index']);

    // Broadcasting auth con Sanctum (EventSource no puede enviar headers, pero Echo sí)
    Route::post('/broadcasting/auth', fn () => Broadcast::auth(request()));

    // Chat
    Route::get('/chat/conversations',                        [ChatController::class, 'conversations']);
    Route::post('/chat/conversations',                       [ChatController::class, 'createConversation']);
    Route::get('/chat/conversations/{orderId}/messages',     [ChatController::class, 'messages']);
    Route::post('/chat/conversations/{orderId}/messages',    [ChatController::class, 'sendMessage'])->middleware('throttle:30,1');
    Route::patch('/chat/conversations/{orderId}/hide',       [ChatController::class, 'hideConversation']);

});
