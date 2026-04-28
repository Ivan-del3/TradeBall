<?php

namespace App\Listeners;

use App\Events\PurchaseConfirmed;
use App\Repositories\WalletRepository;

class DeductBuyerWallet
{
    public function __construct(private WalletRepository $repo) {}

    public function handle(PurchaseConfirmed $event): void
    {
        $order = $event->order;

        $buyerWallet  = $this->repo->findByUser($order->buyer_id);
        $sellerWallet = $this->repo->findByUser($order->seller_id);

        if ($buyerWallet) {
            $this->repo->subtractBalance($buyerWallet, $order->purchase_price, 'pago_pedido', $order->id);
        }

        if ($sellerWallet) {
            $this->repo->addBalance($sellerWallet, $order->purchase_price, 'cobro_pedido', $order->id);
        }
    }
}
