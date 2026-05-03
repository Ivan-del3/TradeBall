<?php

namespace App\Services;

use App\Events\PurchaseConfirmed;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Wallet;
use App\Repositories\PurchaseRepository;
use App\Repositories\WalletRepository;
use Illuminate\Support\Facades\DB;

class PurchaseService
{
    public function __construct(
        private PurchaseRepository $purchaseRepo,
        private WalletRepository $walletRepo,
    ) {}

    public function requestPurchase(User $buyer, int $productId): Order
    {
        return DB::transaction(function () use ($buyer, $productId) {
            // Lock de fila: impide que dos peticiones simultáneas lean
            // el mismo producto como 'disponible' y ambas procedan.
            $product = Product::where('visible', true)
                ->lockForUpdate()
                ->findOrFail($productId);

            if ($product->user_id === $buyer->id) {
                throw new \InvalidArgumentException('No puedes comprar tu propio producto.');
            }

            if ($product->available !== 'disponible') {
                throw new \InvalidArgumentException('Este producto no está disponible para la compra.');
            }

            // Lock de fila sobre el wallet: evita que dos retiros
            // concurrentes pasen el check de saldo al mismo tiempo.
            $wallet = Wallet::where('user_id', $buyer->id)->lockForUpdate()->first();

            if (!$wallet || $wallet->balance < $product->price) {
                throw new \InvalidArgumentException('Saldo insuficiente para realizar la compra.');
            }

            $order = $this->purchaseRepo->createOrder(
                $buyer->id,
                $product->user_id,
                $product->id,
                $product->price,
            );

            $product->update(['available' => 'reservado']);

            return $order;
        });
    }

    public function confirmPurchase(User $seller, int $orderId): Order
    {
        $order = Order::where('id', $orderId)
            ->where('seller_id', $seller->id)
            ->where('status', 'pendiente')
            ->with(['product', 'buyer'])
            ->firstOrFail();

        $order->update(['status' => 'completado', 'escrow_active' => false]);
        $order->product->update(['available' => 'vendido']);

        event(new PurchaseConfirmed($order));

        return $order;
    }

    public function rejectPurchase(User $seller, int $orderId): Order
    {
        $order = Order::where('id', $orderId)
            ->where('seller_id', $seller->id)
            ->where('status', 'pendiente')
            ->with('product')
            ->firstOrFail();

        $order->update(['status' => 'cancelado', 'escrow_active' => false]);
        $order->product->update(['available' => 'disponible']);

        return $order;
    }
}
