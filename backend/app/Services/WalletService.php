<?php

namespace App\Services;

use App\Models\User;
use App\Models\Wallet;
use App\Repositories\WalletRepository;

class WalletService
{
    public function __construct(private WalletRepository $repo) {}

    public function getOrCreate(User $user): Wallet
    {
        return $user->wallet ?? $this->repo->createForUser($user->id);
    }

    public function deposit(User $user, float $amount): Wallet
    {
        if ($amount <= 0 || $amount > 99999) {
            throw new \InvalidArgumentException('Importe no válido. El máximo es 99.999€.');
        }

        $wallet = $this->getOrCreate($user);

        if ($wallet->balance + $amount > 99999) {
            throw new \InvalidArgumentException('El saldo no puede superar los 99.999€.');
        }

        $this->repo->addBalance($wallet, $amount, 'deposito');

        return $wallet->fresh(['transactions' => fn($q) => $q->orderBy('created_at', 'desc')->limit(20)]);
    }

    public function withdraw(User $user, float $amount): Wallet
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('El importe debe ser mayor que cero.');
        }

        $wallet = $this->getOrCreate($user);

        if ($wallet->balance < $amount) {
            throw new \InvalidArgumentException('Saldo insuficiente.');
        }

        $this->repo->subtractBalance($wallet, $amount, 'retirada');

        return $wallet->fresh(['transactions' => fn($q) => $q->orderBy('created_at', 'desc')->limit(20)]);
    }
}
