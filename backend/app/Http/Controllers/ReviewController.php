<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $reviews = $request->user()
            ->receivedReviews()
            ->with(['user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reviews);
    }
}