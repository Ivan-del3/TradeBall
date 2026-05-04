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
            $product = Product::where('visible', true)
                ->lockForUpdate()
                ->findOrFail($productId);

            if ($product->user_id === $buyer->id) {
                throw new \InvalidArgumentException('No puedes comprar tu propio producto.');
            }

            if ($product->available !== 'disponible') {
                throw new \InvalidArgumentException('Este producto no está disponible para la compra.');
            }

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

    // Vendedor acepta la solicitud de compra (producto en camino/preparado)
    public function confirmPurchase(User $seller, int $orderId): Order
    {
        $order = Order::where('id', $orderId)
            ->where('seller_id', $seller->id)
            ->where('status', 'pendiente')
            ->with(['product', 'buyer'])
            ->firstOrFail();

        $order->update(['status' => 'confirmado']);

        return $order;
    }

    // Vendedor rechaza la solicitud de compra inicial
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

    // Comprador confirma que ha recibido el producto en buen estado se realiza la transacción
    public function buyerConfirmReceipt(User $buyer, int $orderId): Order
    {
        $order = Order::where('id', $orderId)
            ->where('buyer_id', $buyer->id)
            ->where('status', 'confirmado')
            ->with(['product', 'buyer', 'seller'])
            ->firstOrFail();

        $order->update(['status' => 'completado', 'escrow_active' => false]);
        $order->product->update(['available' => 'vendido']);

        event(new PurchaseConfirmed($order));

        return $order;
    }

    // Comprador indica que el producto no está en las condiciones esperadas, solicita devolución
    public function buyerRejectReceipt(User $buyer, int $orderId): Order
    {
        $order = Order::where('id', $orderId)
            ->where('buyer_id', $buyer->id)
            ->where('status', 'confirmado')
            ->with('product')
            ->firstOrFail();

        $order->update(['status' => 'devolucion_solicitada']);

        return $order;
    }

    // Vendedor confirma que ha recibido el producto devuelto → se cancela la orden y el producto vuelve a la venta
    public function sellerConfirmReturn(User $seller, int $orderId): Order
    {
        $order = Order::where('id', $orderId)
            ->where('seller_id', $seller->id)
            ->where('status', 'devolucion_solicitada')
            ->with('product')
            ->firstOrFail();

        $order->update(['status' => 'cancelado', 'escrow_active' => false]);
        $order->product->update(['available' => 'disponible']);

        return $order;
    }
}
