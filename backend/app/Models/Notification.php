<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = ['title', 'content', 'image', 'type'];

    public function users() {
        return $this->belongsToMany(User::class, 'notification_user')
            ->withPivot('read')
            ->withTimestamps();
    }
}