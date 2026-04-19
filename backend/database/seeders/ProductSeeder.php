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
                'category_id' => 1, // Cartas
                'name'        => 'Charizard VMAX Rainbow Rare',
                'price'       => 89.99,
                'condition'   => 'casi_nuevo',
                'description' => 'Charizard VMAX en perfecto estado, viene en su funda protectora. Comprada en tienda oficial.',
                'image'       => 'https://images.wikidexcdn.net/mwuploads/wikidex/0/02/latest/20201113022241/Charizard_(Voltaje_V%C3%ADvido_TCG).png',
            ],
            [
                'category_id' => 1,
                'name'        => 'Pikachu Ilustrador Promo',
                'price'       => 249.99,
                'condition'   => 'nuevo',
                'description' => 'Carta promo Pikachu Ilustrador, nunca jugada. Certificado de autenticidad incluido.',
                'image'       => 'https://images.pokemontcg.io/basep/1_hires.png',
            ],
            [
                'category_id' => 1,
                'name'        => 'Mewtwo EX Full Art',
                'price'       => 34.50,
                'condition'   => 'usado',
                'description' => 'Mewtwo EX Full Art de la expansión Legendary Treasures. Leve desgaste en bordes.',
                'image'       => 'https://images.pokemontcg.io/xy8/61_hires.png',
            ],
            [
                'category_id' => 2, // Figuras
                'name'        => 'Figura Gengar Nendoroid',
                'price'       => 55.00,
                'condition'   => 'nuevo',
                'description' => 'Figura Nendoroid de Gengar en caja original sellada. Importación japonesa.',
                'image'       => 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/094.png',
            ],
            [
                'category_id' => 2,
                'name'        => 'Figura Snorlax Funko Pop',
                'price'       => 18.99,
                'condition'   => 'casi_nuevo',
                'description' => 'Funko Pop Snorlax #643, caja en buen estado con leve golpe en esquina.',
                'image'       => 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/143.png',
            ],
            [
                'category_id' => 3, // Videojuegos
                'name'        => 'Pokémon Esmeralda GBA',
                'price'       => 75.00,
                'condition'   => 'usado',
                'description' => 'Cartucho original de Pokémon Esmeralda para Game Boy Advance. Batería funcional.',
                'image'       => 'https://tse1.explicit.bing.net/th/id/OIP.BmZ-1hcZh5HAYduhH0MjKgAAAA?rs=1&pid=ImgDetMain&o=7&rm=3',
            ],
            [
                'category_id' => 3,
                'name'        => 'Pokémon Plata Nintendo DS',
                'price'       => 120.00,
                'condition'   => 'casi_nuevo',
                'description' => 'HeartGold/SoulSilver edición plata. Incluye Pokéwalker en caja original.',
                'image'       => 'https://images.wikidexcdn.net/mwuploads/wikidex/d/d0/latest/20241023140611/Pok%C3%A9mon_Edici%C3%B3n_Plata_SoulSilver_car%C3%A1tula_ES.png',
            ],
            [
                'category_id' => 4, // Peluches
                'name'        => 'Peluche Eevee 30cm',
                'price'       => 22.00,
                'condition'   => 'nuevo',
                'description' => 'Peluche oficial de Eevee de 30cm. Centro Pokémon Japón. Nunca usado.',
                'image'       => 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/133.png',
            ],
            [
                'category_id' => 5, // Coleccionables
                'name'        => 'Caja de sobres Evoluciones',
                'price'       => 180.00,
                'condition'   => 'nuevo',
                'description' => 'Caja sellada de 36 sobres de la expansión XY Evoluciones. Sin abrir.',
                'image'       => 'https://images.pokemontcg.io/xy12/logo.png',
            ],
            [
                'category_id' => 1,
                'name'        => 'Blastoise Base Set',
                'price'       => 45.00,
                'condition'   => 'usado',
                'description' => 'Blastoise holo de la Base Set original. Leve desgaste por el tiempo.',
                'image'       => 'https://images.pokemontcg.io/base1/2_hires.png',
            ],
        ];

        foreach ($products as $data) {
            $image = $data['image'];
            unset($data['image']);

            $product = Product::create(array_merge($data, [
                'user_id'   => $user->id,
                'available' => 'disponible',
                'visible'   => true,
            ]));

            ProductImage::create([
                'product_id' => $product->id,
                'image_url'  => $image,
                'is_main'    => true,
            ]);
        }
    }
}