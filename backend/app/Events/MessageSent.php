<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('order.' . $this->message->order_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id'         => $this->message->id,
                'order_id'   => $this->message->order_id,
                'sender_id'  => $this->message->sender_id,
                'message'    => $this->message->message,
                'read'       => $this->message->read,
                'created_at' => $this->message->created_at,
                'sender'     => $this->message->sender,
            ]
        ];
    }
}