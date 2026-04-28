<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Foundation\Events\Dispatchable;

class PurchaseConfirmed
{
    use Dispatchable;

    public function __construct(public readonly Order $order) {}
}
