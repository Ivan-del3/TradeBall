<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ProductControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user     = User::factory()->create(['lastname' => 'Test']);
        $this->category = Category::create(['name' => 'Categoría Test']);
    }


    private function makeProduct(array $overrides = []): Product
    {
        return Product::create(array_merge([
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
            'name'        => 'Producto genérico',
            'price'       => 50.00,
            'condition'   => 'usado',
            'available'   => 'disponible',
            'visible'     => true,
        ], $overrides));
    }


    #[Test]
    public function index_sin_filtros_devuelve_productos_paginados(): void
    {
        $this->makeProduct(['name' => 'Balón de fútbol']);
        $this->makeProduct(['name' => 'Raqueta de tenis']);

        $response = $this->getJson('/api/products');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    #[Test]
    public function filtro_search_devuelve_solo_productos_que_coinciden(): void
    {
        $this->makeProduct(['name' => 'Balón de fútbol']);
        $this->makeProduct(['name' => 'Raqueta de tenis']);

        $response = $this->getJson('/api/products?search=Balón');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('Balón de fútbol', $response->json('data.0.name'));
    }

    #[Test]
    public function filtro_category_id_devuelve_solo_productos_de_esa_categoria(): void
    {
        $otraCategoria = Category::create(['name' => 'Otra categoría']);
        $this->makeProduct(['name' => 'Producto A', 'category_id' => $this->category->id]);
        $this->makeProduct(['name' => 'Producto B', 'category_id' => $otraCategoria->id]);

        $response = $this->getJson("/api/products?category_id={$this->category->id}");

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('Producto A', $response->json('data.0.name'));
    }

    #[Test]
    public function filtro_condition_devuelve_solo_productos_con_ese_estado(): void
    {
        $this->makeProduct(['name' => 'Balón nuevo',   'condition' => 'nuevo']);
        $this->makeProduct(['name' => 'Balón usado',   'condition' => 'usado']);
        $this->makeProduct(['name' => 'Balón casi nuevo', 'condition' => 'casi_nuevo']);

        $response = $this->getJson('/api/products?condition=nuevo');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('Balón nuevo', $response->json('data.0.name'));
    }

    #[Test]
    public function filtro_min_price_excluye_productos_mas_baratos(): void
    {
        $this->makeProduct(['name' => 'Barato',  'price' => 10.00]);
        $this->makeProduct(['name' => 'Caro',    'price' => 100.00]);

        $response = $this->getJson('/api/products?min_price=50');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('Caro', $response->json('data.0.name'));
    }

    #[Test]
    public function filtro_max_price_excluye_productos_mas_caros(): void
    {
        $this->makeProduct(['name' => 'Barato',  'price' => 10.00]);
        $this->makeProduct(['name' => 'Caro',    'price' => 100.00]);

        $response = $this->getJson('/api/products?max_price=50');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('Barato', $response->json('data.0.name'));
    }

    #[Test]
    public function productos_con_visible_false_no_aparecen(): void
    {
        $this->makeProduct(['name' => 'Visible',   'visible' => true]);
        $this->makeProduct(['name' => 'Invisible',  'visible' => false]);

        $response = $this->getJson('/api/products');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('Visible', $response->json('data.0.name'));
    }

    #[Test]
    public function productos_reservados_no_aparecen(): void
    {
        $this->makeProduct(['name' => 'Disponible', 'available' => 'disponible']);
        $this->makeProduct(['name' => 'Reservado',  'available' => 'reservado']);

        $response = $this->getJson('/api/products');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('Disponible', $response->json('data.0.name'));
    }

    #[Test]
    public function productos_vendidos_no_aparecen(): void
    {
        $this->makeProduct(['name' => 'Disponible', 'available' => 'disponible']);
        $this->makeProduct(['name' => 'Vendido',     'available' => 'vendido']);

        $response = $this->getJson('/api/products');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('Disponible', $response->json('data.0.name'));
    }

    #[Test]
    public function combinacion_de_filtros_search_condition_y_precio(): void
    {
        $this->makeProduct(['name' => 'Balón nuevo barato',  'condition' => 'nuevo',  'price' => 20.00]);
        $this->makeProduct(['name' => 'Balón nuevo caro',    'condition' => 'nuevo',  'price' => 200.00]);
        $this->makeProduct(['name' => 'Balón usado barato',  'condition' => 'usado',  'price' => 15.00]);

        $response = $this->getJson('/api/products?search=Balón&condition=nuevo&max_price=50');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('Balón nuevo barato', $response->json('data.0.name'));
    }

    #[Test]
    public function validacion_rechaza_condition_invalido(): void
    {
        $response = $this->getJson('/api/products?condition=excelente');

        $response->assertStatus(422);
    }

    #[Test]
    public function validacion_rechaza_min_price_negativo(): void
    {
        $response = $this->getJson('/api/products?min_price=-1');

        $response->assertStatus(422);
    }

    #[Test]
    public function validacion_rechaza_max_price_negativo(): void
    {
        $response = $this->getJson('/api/products?max_price=-5');

        $response->assertStatus(422);
    }


    #[Test]
    public function respuesta_json_contiene_estructura_data_current_page_last_page(): void
    {
        $this->makeProduct();

        $response = $this->getJson('/api/products');

        $response->assertOk()
                 ->assertJsonStructure([
                     'data'         => [['id', 'name', 'price', 'condition', 'available', 'visible']],
                     'current_page',
                     'last_page',
                 ]);
    }

    #[Test]
    public function paginacion_pagina_2_devuelve_el_bloque_correcto(): void
    {
        // Crear 16 productos para que la página 2 tenga 1 resultado (15 por página)
        for ($i = 1; $i <= 16; $i++) {
            $this->makeProduct(['name' => "Producto {$i}"]);
        }

        $page1 = $this->getJson('/api/products?page=1');
        $page2 = $this->getJson('/api/products?page=2');

        $page1->assertOk();
        $page2->assertOk();

        $this->assertCount(15, $page1->json('data'));
        $this->assertCount(1,  $page2->json('data'));
        $this->assertSame(2, $page2->json('current_page'));
        $this->assertSame(2, $page1->json('last_page'));

        // Los IDs de página 1 y página 2 no se solapan
        $ids1 = array_column($page1->json('data'), 'id');
        $ids2 = array_column($page2->json('data'), 'id');
        $this->assertEmpty(array_intersect($ids1, $ids2));
    }
}
