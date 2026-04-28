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
        $user1 = User::firstOrCreate(
            ['email' => 'trainer@tradeball.com'],
            [
                'name'      => 'Cintia',
                'lastname'  => 'Artemis',
                'password'  => bcrypt('garchomp'),
                'rol'       => 'customer',
                'is_active' => true,
            ]
        );

        Wallet::firstOrCreate(['user_id' => $user1->id], ['balance' => 0]);

        $user2 = User::firstOrCreate(
            ['email' => 'i@i.es'],
            [
                'name'      => 'Iván',
                'lastname'  => 'Nagato',
                'password'  => bcrypt('12345678'),
                'rol'       => 'customer',
                'is_active' => true,
            ]
        );

        Wallet::firstOrCreate(['user_id' => $user2->id], ['balance' => 0]);

        $products = [
            [
                'user_id'     => $user1->id,
                'category_id' => 1,
                'name'        => 'Pikachu V Full Art',
                'price'       => 45.00,
                'condition'   => 'nuevo',
                'description' => 'Pikachu V Full Art de la expansión Vivid Voltage. Carta sin usar, guardada en sleeve desde el primer día.',
                'images'      => [
                    ['url' => 'https://images.pokemontcg.io/swsh4/170_hires.png', 'main' => true],
                ],
            ],
            [
                'user_id'     => $user1->id,
                'category_id' => 1,
                'name'        => 'Mewtwo EX Full Art',
                'price'       => 34.50,
                'condition'   => 'usado',
                'description' => 'Mewtwo EX Full Art de Legendary Treasures. Leve desgaste en bordes visible solo de cerca.',
                'images'      => [
                    ['url' => 'https://images.pokemontcg.io/xy8/61_hires.png', 'main' => true],
                ],
            ],
            [
                'user_id'     => $user1->id,
                'category_id' => 1,
                'name'        => 'Blastoise Base Set Holo',
                'price'       => 120.00,
                'condition'   => 'usado',
                'description' => 'Blastoise holo de la Base Set original 1999. Desgaste normal por el tiempo.',
                'images'      => [
                    ['url' => 'https://images.pokemontcg.io/base1/2_hires.png', 'main' => true],
                ],
            ],
            [
                'user_id'     => $user1->id,
                'category_id' => 2,
                'name'        => 'Figura Gengar Nendoroid',
                'price'       => 55.00,
                'condition'   => 'nuevo',
                'description' => 'Figura Nendoroid de Gengar en caja original sellada. Importación japonesa directa.',
                'images'      => [
                    ['url' => 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/094.png', 'main' => true],
                ],
            ],
            [
                'user_id'     => $user1->id,
                'category_id' => 2,
                'name'        => 'Figura Snorlax Funko Pop',
                'price'       => 18.99,
                'condition'   => 'casi_nuevo',
                'description' => 'Funko Pop Snorlax #643. Caja en buen estado con leve golpe en esquina.',
                'images'      => [
                    ['url' => 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/143.png', 'main' => true],
                ],
            ],
            [
                'user_id'     => $user1->id,
                'category_id' => 3,
                'name'        => 'Pokémon Esmeralda GBA',
                'price'       => 75.00,
                'condition'   => 'usado',
                'description' => 'Cartucho original de Pokémon Esmeralda para Game Boy Advance. Batería funcional.',
                'images'      => [
                    ['url' => 'https://tse1.explicit.bing.net/th/id/OIP.BmZ-1hcZh5HAYduhH0MjKgAAAA?rs=1&pid=ImgDetMain&o=7&rm=3', 'main' => true],
                ],
            ],
            [
                'user_id'     => $user1->id,
                'category_id' => 3,
                'name'        => 'Pokémon SoulSilver DS',
                'price'       => 120.00,
                'condition'   => 'casi_nuevo',
                'description' => 'Pokémon SoulSilver para Nintendo DS. Incluye Pokéwalker en caja original.',
                'images'      => [
                    ['url' => 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/5/5c/latest/20211108121148/Pok%C3%A9mon_Edici%C3%B3n_Plata_SoulSilver_car%C3%A1tula_ES.jpg/250px-Pok%C3%A9mon_Edici%C3%B3n_Plata_SoulSilver_car%C3%A1tula_ES.jpg', 'main' => true],
                ],
            ],
            [
                'user_id'     => $user1->id,
                'category_id' => 4,
                'name'        => 'Peluche Eevee 30cm',
                'price'       => 22.00,
                'condition'   => 'nuevo',
                'description' => 'Peluche oficial de Eevee de 30cm del Centro Pokémon Japón.',
                'images'      => [
                    ['url' => 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/133.png', 'main' => true],
                ],
            ],
            [
                'user_id'     => $user1->id,
                'category_id' => 5,
                'name'        => 'Caja sellada XY Evoluciones',
                'price'       => 180.00,
                'condition'   => 'nuevo',
                'description' => 'Caja sellada de 36 sobres de la expansión XY Evoluciones. Sin abrir.',
                'images'      => [
                    ['url' => 'https://images.pokemontcg.io/xy12/logo.png', 'main' => true],
                ],
            ],

            [
                'user_id'     => $user2->id,
                'category_id' => 1,
                'name'        => 'Umbreon Prime',
                'price'       => 150.00,
                'condition'   => 'casi_nuevo',
                'description' => 'Carta Umbreon Prime de la expansión HS—Indomable. Una joya para coleccionistas de tipo siniestro. Estado Impecable (NM).',
                'images'      => [
                    ['url' => 'https://tse4.mm.bing.net/th/id/OIP.YyqBcPGeuKZinMuNXBw0TwHaKV?rs=1&pid=ImgDetMain&o=7&rm=3', 'main' => true],
                ],
            ],
            [
                'user_id'     => $user2->id,
                'category_id' => 1,
                'name'        => 'Rayquaza Star (Gold Star)',
                'price'       => 450.00,
                'condition'   => 'usado',
                'description' => 'Rayquaza Star de la expansión EX Deoxys. Una de las cartas más raras y codiciadas del TCG. El borde tiene un ligero desgaste.',
                'images'      => [
                    ['url' => 'https://tse4.mm.bing.net/th/id/OIP.yrLR3kD0SIrwjcvsIGs6NgHaKe?rs=1&pid=ImgDetMain&o=7&rm=3', 'main' => true],
                ],
            ],
            [
                'user_id'     => $user2->id,
                'category_id' => 1,
                'name'        => 'Lugia Neo Genesis Holo',
                'price'       => 210.00,
                'condition'   => 'casi_nuevo',
                'description' => 'Lugia Holográfico original de la colección Neo Genesis. El guardián de los mares en su versión más icónica.',
                'images'      => [
                    ['url' => 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/1/16/latest/20210727132216/Lugia_(Neo_G%C3%A9nesis_TCG).png/800px-Lugia_(Neo_G%C3%A9nesis_TCG).png', 'main' => true],
                ],
            ],
        ];


        foreach ($products as $data) {
            $images = $data['images'];
            unset($data['images']);

            $product = Product::create(array_merge($data, [
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