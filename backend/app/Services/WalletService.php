<?php

namespace App\Services;

use App\Models\User;
use App\Models\Wallet;
use App\Repositories\WalletRepository;
use Illuminate\Support\Facades\DB;

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

        return DB::transaction(function () use ($user, $amount) {
            $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->first()
                ?? $this->repo->createForUser($user->id);

            if ($wallet->balance + $amount > 99999) {
                throw new \InvalidArgumentException('El saldo no puede superar los 99.999€.');
            }

            $this->repo->addBalance($wallet, $amount, 'deposito');

            return $wallet->fresh(['transactions' => fn($q) => $q->orderBy('created_at', 'desc')->limit(20)]);
        });
    }

    public function withdraw(User $user, float $amount): Wallet
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('El importe debe ser mayor que cero.');
        }

        return DB::transaction(function () use ($user, $amount) {
            $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->firstOrFail();

            $pendingReserved = $user->purchases()
                ->where('status', 'pendiente')
                ->where('escrow_active', true)
                ->sum('purchase_price');

            $available = $wallet->balance - $pendingReserved;

            if ($available < $amount) {
                throw new \InvalidArgumentException(
                    'Saldo insuficiente. Tienes compras pendientes de aceptación que reservan parte de tu saldo.'
                );
            }

            $this->repo->subtractBalance($wallet, $amount, 'retirada');

            return $wallet->fresh(['transactions' => fn($q) => $q->orderBy('created_at', 'desc')->limit(20)]);
        });
    }
}
