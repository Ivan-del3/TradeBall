<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'buyer_id', 'seller_id', 'product_id',
        'purchase_price', 'status', 'escrow_active',
    ];

    protected function casts(): array
    {
        return ['escrow_active' => 'boolean'];
    }

    public function buyer() {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller() {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function product() {
        return $this->belongsTo(Product::class);
    }

    public function transactions() {
        return $this->hasMany(Transaction::class);
    }

    public function messages() {
        return $this->hasMany(Message::class);
    }

    public function reviews() {
        return $this->hasMany(Review::class);
    }

    public function reports() {
        return $this->hasMany(Report::class);
    }
}