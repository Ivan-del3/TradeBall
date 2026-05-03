<?php

namespace App\Http\Controllers;

use App\Services\WalletService;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(private WalletService $walletService) {}

    public function show(Request $request)
    {
        $wallet = $request->user()
            ->wallet()
            ->with(['transactions' => fn($q) => $q->orderBy('created_at', 'desc')->limit(20)])
            ->first();

        return response()->json($wallet);
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
