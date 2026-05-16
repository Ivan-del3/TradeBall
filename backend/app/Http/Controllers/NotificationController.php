<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function counts(Request $request)
    {
        $userId = $request->user()->id;

        // Productos del vendedor que requieren acción (compra pendiente o devolución solicitada)
        $sales = $request->user()
            ->products()
            ->where('is_deleted', false)
            ->whereHas('pendingOrder')
            ->count();

        // Compras confirmadas por el vendedor donde el comprador aún no ha decidido
        $purchases = $request->user()
            ->purchases()
            ->where('status', 'confirmado')
            ->count();

        // Mensajes no leídos en conversaciones no ocultas
        $chat = Message::whereHas('order', function ($q) use ($userId) {
                $q->where(function ($inner) use ($userId) {
                    $inner->where('buyer_id', $userId)
                          ->where('hidden_by_buyer', false);
                })->orWhere(function ($inner) use ($userId) {
                    $inner->where('seller_id', $userId)
                          ->where('hidden_by_seller', false);
                });
            })
            ->where('sender_id', '!=', $userId)
            ->where('read', false)
            ->count();

        // Total de valoraciones recibidas (el frontend descuenta las ya vistas vía localStorage)
        $reviews = $request->user()->receivedReviews()->count();

        return response()->json([
            'sales'     => $sales,
            'purchases' => $purchases,
            'chat'      => $chat,
            'reviews'   => $reviews,
        ]);
    }
}
