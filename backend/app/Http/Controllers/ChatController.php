<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Order;
use App\Models\Message;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function conversations(Request $request)
    {
        $userId = $request->user()->id;

        $orders = Order::where(function ($q) use ($userId) {
                $q->where(function ($inner) use ($userId) {
                    $inner->where('buyer_id', $userId)
                          ->where('hidden_by_buyer', false);
                })->orWhere(function ($inner) use ($userId) {
                    $inner->where('seller_id', $userId)
                          ->where('hidden_by_seller', false);
                });
            })
            ->with([
                'product.mainImage',
                'buyer',
                'seller',
                'messages' => fn($q) => $q->latest()->limit(1),
            ])
            ->withCount(['messages as unread_count' => function ($q) use ($userId) {
                $q->where('sender_id', '!=', $userId)
                  ->where('read', false);
            }])
            ->get()
            ->map(function ($order) {
                return [
                    'id'           => $order->id,
                    'product'      => $order->product,
                    'buyer'        => $order->buyer,
                    'seller'       => $order->seller,
                    'last_message' => $order->messages->first(),
                    'unread_count' => $order->unread_count,
                ];
            });

        return response()->json($orders);
    }

    public function createConversation(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $product = \App\Models\Product::findOrFail($request->product_id);

        if ($product->user_id === $request->user()->id) {
            return response()->json(['message' => 'No puedes contactar contigo mismo'], 422);
        }

        $order = Order::where('buyer_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->first();

        if (!$order) {
            $order = Order::create([
                'buyer_id'       => $request->user()->id,
                'seller_id'      => $product->user_id,
                'product_id'     => $product->id,
                'status'         => 'pendiente',
                'purchase_price' => $product->price,
                'escrow_active'  => true,
            ]);
        } else {
            // Restore visibility if the buyer had hidden it
            if ($order->hidden_by_buyer) {
                $order->update(['hidden_by_buyer' => false]);
            }
        }

        return response()->json($order->load(['product.mainImage', 'buyer', 'seller']));
    }

    public function messages(Request $request, $orderId)
    {
        $userId = $request->user()->id;

        $order = Order::where('id', $orderId)
            ->where(function ($q) use ($userId) {
                $q->where('buyer_id', $userId)
                  ->orWhere('seller_id', $userId);
            })
            ->firstOrFail();

        Message::where('order_id', $orderId)
            ->where('sender_id', '!=', $userId)
            ->where('read', false)
            ->update(['read' => true]);

        $messages = Message::where('order_id', $orderId)
            ->with('sender')
            ->orderBy('created_at')
            ->get();

        return response()->json($messages);
    }

    public function sendMessage(Request $request, $orderId)
    {
        $userId = $request->user()->id;

        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $order = Order::where('id', $orderId)
            ->where(function ($q) use ($userId) {
                $q->where('buyer_id', $userId)
                  ->orWhere('seller_id', $userId);
            })
            ->firstOrFail();

        $message = Message::create([
            'order_id'  => $order->id,
            'sender_id' => $userId,
            'message'   => $request->message,
            'read'      => false,
        ]);

        $message->load('sender');

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message);
    }

    public function hideConversation(Request $request, $orderId)
    {
        $userId = $request->user()->id;

        $order = Order::where('id', $orderId)
            ->where(function ($q) use ($userId) {
                $q->where('buyer_id', $userId)
                  ->orWhere('seller_id', $userId);
            })
            ->firstOrFail();

        if ($order->buyer_id === $userId) {
            $order->update(['hidden_by_buyer' => true]);
        } else {
            $order->update(['hidden_by_seller' => true]);
        }

        return response()->json(['message' => 'Conversación eliminada']);
    }
}
