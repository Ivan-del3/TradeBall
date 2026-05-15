<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $reviews = $request->user()
            ->receivedReviews()
            ->with(['user', 'order.product.mainImage'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reviews);
    }

    public function userReviews(int $userId)
    {
        $reviews = Review::where('reviewed_user_id', $userId)
            ->with(['user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
            'rating'   => 'required|integer|min:1|max:5',
            'comment'  => 'nullable|string|max:1000',
        ]);

        $order = Order::where('id', $validated['order_id'])
            ->where('status', 'completado')
            ->where(function ($q) use ($request) {
                $q->where('buyer_id', $request->user()->id)
                  ->orWhere('seller_id', $request->user()->id);
            })
            ->firstOrFail();

        if ($order->reviews()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Ya has valorado esta transacción.'], 422);
        }

        $reviewedUserId = $order->buyer_id === $request->user()->id
            ? $order->seller_id
            : $order->buyer_id;

        $review = Review::create([
            'order_id'         => $order->id,
            'user_id'          => $request->user()->id,
            'reviewed_user_id' => $reviewedUserId,
            'rating'           => $validated['rating'],
            'comment'          => $validated['comment'] ?? null,
        ]);

        return response()->json($review->load('user'), 201);
    }
}
