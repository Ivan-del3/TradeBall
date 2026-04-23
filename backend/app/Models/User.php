<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'rol', 'name', 'lastname', 'email', 'password',
        'number', 'address', 'is_active', 'avatar_url',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
        ];
    }

    public function wallet() {
        return $this->hasOne(Wallet::class); 
    }

    public function products() {
        return $this->hasMany(Product::class);
    }

    public function favorites() {
        return $this->belongsToMany(Product::class, 'favorites')->withTimestamps();
    
    }

    public function purchases() {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    public function sales() {
        return $this->hasMany(Order::class, 'seller_id');
    }

    public function reviews() { 
        return $this->hasMany(Review::class); 
    }

    public function receivedReviews() { 
        return $this->hasMany(Review::class, 'reviewed_user_id'); 
    }

    public function notifications() { 
        return $this->belongsToMany(Notification::class, 'notification_user')->withPivot('read')->withTimestamps(); 
    }

    public function reports() { 
        return $this->hasMany(Report::class); 
    }

    public function sentMessages() { 
        return $this->hasMany(Message::class, 'sender_id');
    }
}