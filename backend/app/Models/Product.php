<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'user_id', 'category_id', 'name', 'price',
        'condition', 'description', 'available', 'visible',
    ];

    protected function casts(): array {
        return ['visible' => 'boolean'];
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function category() {
        return $this->belongsTo(Category::class);
    }

    public function images() {
        return $this->hasMany(ProductImage::class);
    }

    public function mainImage() {
        return $this->hasOne(ProductImage::class)
            ->where('is_main', true);
    }

    public function favoritedBy() {
        return $this->belongsToMany(User::class, 'favorites')
            ->withTimestamps();
    }

    public function order() {
        return $this->hasOne(Order::class)->latestOfMany();
    }

    public function pendingOrder() {
        return $this->hasOne(Order::class)->where('status', 'pendiente');
    }
}