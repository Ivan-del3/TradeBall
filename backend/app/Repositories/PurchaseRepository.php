<?php

namespace App\Repositories;

use App\Models\Order;

class PurchaseRepository
{
    public function createOrder(int $buyerId, int $sellerId, int $productId, float $price): Order
    {
        return Order::create([
            'buyer_id'       => $buyerId,
            'seller_id'      => $sellerId,
            'product_id'     => $productId,
            'purchase_price' => $price,
            'status'         => 'pendiente',
            'escrow_active'  => true,
        ]);
    }
}
