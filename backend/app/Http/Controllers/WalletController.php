<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function show(Request $request)
    {
        $wallet = $request->user()
            ->wallet()
            ->with(['transactions' => fn($q) => $q->orderBy('created_at', 'desc')->limit(20)])
            ->first();

        return response()->json($wallet);
    }
}