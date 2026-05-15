<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SalesController extends Controller
{
    public function index(Request $request)
    {
        $sales = $request->user()
            ->products()
            ->where('is_deleted', false)
            ->with(['mainImage', 'category', 'pendingOrder.buyer', 'completedOrder.buyer', 'completedOrder.reviews'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($sales);
    }
}
