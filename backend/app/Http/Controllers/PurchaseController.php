<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        $purchases = $request->user()
            ->purchases()
            ->with(['product.mainImage', 'seller'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($purchases);
    }
}