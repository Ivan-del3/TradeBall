<?php

namespace App\Http\Controllers;

use App\Services\PurchaseService;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function __construct(private PurchaseService $purchaseService) {}

    public function index(Request $request)
    {
        $purchases = $request->user()
            ->purchases()
            ->where('status', 'completado')
            ->with(['product.mainImage', 'seller'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($purchases);
    }

    public function store(Request $request)
    {
        $request->validate(['product_id' => 'required|integer|exists:products,id']);

        try {
            $order = $this->purchaseService->requestPurchase($request->user(), (int) $request->product_id);
            return response()->json($order, 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function confirm(Request $request, int $id)
    {
        try {
            $order = $this->purchaseService->confirmPurchase($request->user(), $id);
            return response()->json($order);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function reject(Request $request, int $id)
    {
        try {
            $order = $this->purchaseService->rejectPurchase($request->user(), $id);
            return response()->json($order);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
