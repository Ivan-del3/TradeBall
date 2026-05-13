<?php

namespace App\Http\Controllers;

use App\Services\WalletService;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(private WalletService $walletService) {}

    public function show(Request $request)
    {
        $user = $request->user();

        $wallet = $user->wallet()
            ->with(['transactions' => fn($q) => $q->orderBy('created_at', 'desc')->limit(20)])
            ->first();

        $pendingAmount = (float) $user->purchases()
            ->where('status', 'pendiente')
            ->where('escrow_active', true)
            ->sum('purchase_price');

        $data = $wallet->toArray();
        $data['pending_amount'] = $pendingAmount;

        return response()->json($data);
    }

    public function deposit(Request $request)
    {
        $request->validate(['amount' => 'required|numeric|min:0.01|max:99999']);

        try {
            $wallet = $this->walletService->deposit($request->user(), (float) $request->amount);
            return response()->json($wallet);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function withdraw(Request $request)
    {
        $request->validate(['amount' => 'required|numeric|min:0.01']);

        try {
            $wallet = $this->walletService->withdraw($request->user(), (float) $request->amount);
            return response()->json($wallet);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
