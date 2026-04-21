<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    // GET /favorites
    public function index(Request $request)
    {
        $favorites = $request->user()
            ->favorites()
            ->with(['mainImage', 'category'])
            ->get();

        return response()->json($favorites);
    }

    // POST /favorites/{productId}
    public function store(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);
        $request->user()->favorites()->syncWithoutDetaching([$product->id]);
        return response()->json(['message' => 'Añadido a favoritos']);
    }

    // DELETE /favorites/{productId}
    public function destroy(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);
        $request->user()->favorites()->detach($product->id);
        return response()->json(['message' => 'Eliminado de favoritos']);
    }
}