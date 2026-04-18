<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = ['order_id', 'sender_id', 'message', 'read'];

    protected function casts(): array
    {
        return ['read' => 'boolean'];
    }

    public function order() {
        return $this->belongsTo(Order::class);
    }

    public function sender() {
        return $this->belongsTo(User::class, 'sender_id');
    }
}