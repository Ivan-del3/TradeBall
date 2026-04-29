<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    // GET /api/products
    // Esto es el control del filtro, si no le indican nada por la URL, devuelve todos los productos (máx 12 por página)

    public function index(Request $request)
    {
        $query = Product::with(['user', 'mainImage', 'category'])
            ->where('visible', true)
            ->where('available', 'disponible');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->condition) {
            $query->where('condition', $request->condition);
        }

        if ($request->min_price) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->max_price) {
            $query->where('price', '<=', $request->max_price);
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(12);

        return response()->json($products);
    }

    // GET /api/products/5
    // Devuelvo un producto por su ID al hacer click en él, cargamos todas la imagenes del producto, si no existe 404.
    public function show(Request $request, $id)
    {
        $product = Product::with(['user', 'images', 'category'])
            ->where('visible', true)
            ->findOrFail($id);

        $alreadyPurchased = false;
        if ($request->user() && $product->available === 'vendido') {
            $alreadyPurchased = Order::where('buyer_id', $request->user()->id)
                ->where('product_id', $product->id)
                ->exists();
        }

        return response()->json(array_merge($product->toArray(), [
            'already_purchased' => $alreadyPurchased,
        ]));
    }

    // GET /api/categories
    public function categories()
    {
        return response()->json(Category::all());
    }

    // POST /api/products (ruta protegida, requiere token)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name'        => 'required|string|max:150',
            'price'       => 'required|numeric|min:0|max:99999',
            'condition'   => 'required|in:nuevo,casi_nuevo,usado',
            'description' => 'nullable|string',
            'images'      => 'required|array|min:1|max:5',
            'images.*'    => 'image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        
        // Creo el producto mezclando los datos validados que ha introducido el usuario, con los datos manuales del array.
        $product = Product::create(array_merge($validated, [
            'user_id'   => $request->user()->id, // Al tener el token, puedo extraer el id del propio usuario que ha hecho la petición.
            'available' => 'disponible',
            'visible'   => true,
        ]));

        // Guardo las imegenes en storage/app/public/products/, la URL en la base de datos
        foreach ($request->file('images') as $index => $image) {
            $path = $image->store('products', 'public');
            ProductImage::create([
                'product_id' => $product->id,
                'image_url'  => config('app.url') . '/storage/' . $path,
                'is_main'    => $index === 0,
            ]);
        }

        // Devuelvo el producto y la relación con imagenes y categorias para mostrar todo sin hacer otra petición al servidor
        return response()->json(
            $product->load(['images', 'category']),
            201
        );
    }

    // PUT /api/products/5 (ruta protegida, requiere token)
    // Al tener el token, puedo asegurarme de que el ususario que va a realizar la acción es dueño de ese producto.
    public function update(Request $request, $id)
    {
        $product = Product::where('user_id', $request->user()->id)->findOrFail($id); // findOrFail id Producto, si no, 404

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:150',
            'price'       => 'sometimes|numeric|min:0|max:99999',
            'condition'   => 'sometimes|in:nuevo,casi_nuevo,usado',
            'description' => 'nullable|string',
            'available'   => 'sometimes|in:disponible,reservado,vendido',
            'visible'     => 'sometimes|boolean',
        ]);

        $product->update($validated);

        return response()->json($product->load(['images', 'category']));
    }

    // DELETE /api/products/5
    // Borro la imágenes del servidor y después el registro de la base de datos
    public function destroy(Request $request, $id)
    {
        $product = Product::where('user_id', $request->user()->id)->findOrFail($id);

        
        foreach ($product->images as $image) {
            $path = str_replace('/storage/', '', $image->image_url);
            Storage::disk('public')->delete($path);
        }

        $product->delete();

        return response()->json(['message' => 'Producto eliminado']);
    }

}