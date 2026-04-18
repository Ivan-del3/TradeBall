<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = ['wallet_id', 'order_id', 'amount', 'type'];

    public function wallet() {
        return $this->belongsTo(Wallet::class);
    }

    public function order() {
        return $this->belongsTo(Order::class);
    }
}