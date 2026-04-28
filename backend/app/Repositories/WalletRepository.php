<?php

namespace App\Repositories;

use App\Models\Transaction;
use App\Models\Wallet;

class WalletRepository
{
    public function findByUser(int $userId): ?Wallet
    {
        return Wallet::where('user_id', $userId)->first();
    }

    public function createForUser(int $userId): Wallet
    {
        return Wallet::create(['user_id' => $userId, 'balance' => 0]);
    }

    public function addBalance(Wallet $wallet, float $amount, string $type, ?int $orderId = null): void
    {
        $wallet->increment('balance', $amount);
        Transaction::create([
            'wallet_id' => $wallet->id,
            'order_id'  => $orderId,
            'amount'    => $amount,
            'type'      => $type,
        ]);
    }

    public function subtractBalance(Wallet $wallet, float $amount, string $type, ?int $orderId = null): void
    {
        $wallet->decrement('balance', $amount);
        Transaction::create([
            'wallet_id' => $wallet->id,
            'order_id'  => $orderId,
            'amount'    => $amount,
            'type'      => $type,
        ]);
    }
}
