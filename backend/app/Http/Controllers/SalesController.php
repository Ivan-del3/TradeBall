<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SalesController extends Controller
{
    public function index(Request $request)
    {
        $sales = $request->user()
            ->products()
            ->with(['mainImage', 'category', 'pendingOrder.buyer'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($sales);
    }
}
