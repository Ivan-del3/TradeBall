<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use App\Models\Wallet;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'trainer@tradeball.com'],
            [
                'name'      => 'Cintia',
                'lastname'  => 'Artemis',
                'password'  => bcrypt('garchomp'),
                'rol'       => 'customer',
                'is_active' => true,
            ]
        );

        Wallet::firstOrCreate(['user_id' => $user->id], ['balance' => 0]);

        $products = [
            [
                'category_id' => 1,
                'name'        => 'Charizard VMAX Rainbow Rare',
                'price'       => 89.99,
                'condition'   => 'casi_nuevo',
                'description' => 'Charizard VMAX en perfecto estado, viene en su funda protectora. Comprada en tienda oficial. Nunca jugada en torneo, solo para colección. Incluye certificado de autenticidad.',
                'images'      => [
                    ['url' => 'https://images.pokemontcg.io/swsh3/74_hires.png', 'main' => true],
                    ['url' => 'https://images.pokemontcg.io/swsh3/73_hires.png', 'main' => false],
                    ['url' => 'https://images.pokemontcg.io/swsh3/75_hires.png', 'main' => false],
                ],
            ],
            [
                'category_id' => 1,
                'name'        => 'Pikachu V Full Art',
                'price'       => 45.00,
                'condition'   => 'nuevo',
                'description' => 'Pikachu V Full Art de la expansión Vivid Voltage. Carta sin usar, guardada en sleeve desde el primer día. Estado impecable.',
                'images'      => [
                    ['url' => 'https://images.pokemontcg.io/swsh4/170_hires.png', 'main' => true],
                    ['url' => 'https://images.pokemontcg.io/swsh4/43_hires.png',  'main' => false],
                ],
            ],
            [
                'category_id' => 1,
                'name'        => 'Mewtwo EX Full Art',
                'price'       => 34.50,
                'condition'   => 'usado',
                'description' => 'Mewtwo EX Full Art de Legendary Treasures. Leve desgaste en bordes visible solo de cerca. Perfectamente legible y jugable.',
                'images'      => [
                    ['url' => 'https://images.pokemontcg.io/xy8/61_hires.png',  'main' => true],
                    ['url' => 'https://images.pokemontcg.io/xy8/62_hires.png',  'main' => false],
                ],
            ],
            [
                'category_id' => 1,
                'name'        => 'Blastoise Base Set Holo',
                'price'       => 120.00,
                'condition'   => 'usado',
                'description' => 'Blastoise holo de la Base Set original 1999. Desgaste normal por el tiempo. Para coleccionistas que buscan completar la base set original.',
                'images'      => [
                    ['url' => 'https://images.pokemontcg.io/base1/2_hires.png', 'main' => true],
                ],
            ],
            [
                'category_id' => 2,
                'name'        => 'Figura Gengar Nendoroid',
                'price'       => 55.00,
                'condition'   => 'nuevo',
                'description' => 'Figura Nendoroid de Gengar en caja original sellada. Importación japonesa directa del Centro Pokémon Tokyo. Incluye accesorios originales.',
                'images'      => [
                    ['url' => 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/094.png', 'main' => true],
                    ['url' => 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/094.png', 'main' => false],
                ],
            ],
            [
                'category_id' => 2,
                'name'        => 'Figura Snorlax Funko Pop',
                'price'       => 18.99,
                'condition'   => 'casi_nuevo',
                'description' => 'Funko Pop Snorlax #643. Caja en buen estado con leve golpe en esquina inferior. La figura interior perfecta.',
                'images'      => [
                    ['url' => 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/143.png', 'main' => true],
                ],
            ],
            [
                'category_id' => 3,
                'name'        => 'Pokémon Esmeralda GBA',
                'price'       => 75.00,
                'condition'   => 'usado',
                'description' => 'Cartucho original de Pokémon Esmeralda para Game Boy Advance. Batería funcional, partida guardada con los 8 badges. Etiqueta en perfecto estado.',
                'images'      => [
                    ['url' => 'https://assets.pokemon.com/assets/cms2/img/misc/games/emerald/pokemon-emerald-logo.png', 'main' => true],
                ],
            ],
            [
                'category_id' => 3,
                'name'        => 'Pokémon SoulSilver DS',
                'price'       => 120.00,
                'condition'   => 'casi_nuevo',
                'description' => 'Pokémon SoulSilver para Nintendo DS. Incluye Pokéwalker en caja original. Caja con leve desgaste en esquinas. Juego y Pokéwalker en perfecto estado.',
                'images'      => [
                    ['url' => 'https://assets.pokemon.com/assets/cms2/img/misc/games/ss/pokemon-soulsilver-logo.png', 'main' => true],
                ],
            ],
            [
                'category_id' => 4,
                'name'        => 'Peluche Eevee 30cm Centro Pokémon',
                'price'       => 22.00,
                'condition'   => 'nuevo',
                'description' => 'Peluche oficial de Eevee de 30cm del Centro Pokémon Japón. Nunca sacado de la bolsa original. Importación personal.',
                'images'      => [
                    ['url' => 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/133.png', 'main' => true],
                    ['url' => 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/134.png', 'main' => false],
                    ['url' => 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/135.png', 'main' => false],
                ],
            ],
            [
                'category_id' => 5,
                'name'        => 'Caja sellada XY Evoluciones',
                'price'       => 180.00,
                'condition'   => 'nuevo',
                'description' => 'Caja sellada de 36 sobres de la expansión XY Evoluciones. Sin abrir. Una de las expansiones más buscadas por coleccionistas por sus reimpresiones de la Base Set.',
                'images'      => [
                    ['url' => 'https://images.pokemontcg.io/xy12/logo.png', 'main' => true],
                ],
            ],
        ];

        foreach ($products as $data) {
            $images = $data['images'];
            unset($data['images']);

            $product = Product::create(array_merge($data, [
                'user_id'   => $user->id,
                'available' => 'disponible',
                'visible'   => true,
            ]));

            foreach ($images as $image) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url'  => $image['url'],
                    'is_main'    => $image['main'],
                ]);
            }
        }
    }
}