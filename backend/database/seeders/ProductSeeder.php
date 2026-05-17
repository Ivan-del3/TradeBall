<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use App\Models\Wallet;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $seedImagesPath = database_path('seeders/images');

        Storage::disk('public')->put('avatars/cintia.jpg', file_get_contents($seedImagesPath . '/cintia.jpg'));
        Storage::disk('public')->put('avatars/personal-image.png', file_get_contents($seedImagesPath . '/personal-image.png'));

        $user1 = User::firstOrCreate(
            ['email' => 'trainer@tradeball.com'],
            [
                'name'       => 'Cintia',
                'lastname'   => 'Artemis',
                'password'   => bcrypt('garchomp'),
                'rol'        => 'customer',
                'is_active'  => true,
                'avatar_url' => config('app.url') . '/storage/avatars/cintia.jpg',
            ]
        );

        Wallet::firstOrCreate(['user_id' => $user1->id], ['balance' => 0]);

        $user2 = User::firstOrCreate(
            ['email' => 'ivan@tradeball.es'],
            [
                'name'       => 'Iván',
                'lastname'   => 'Delgado',
                'password'   => bcrypt('12345678'),
                'rol'        => 'customer',
                'is_active'  => true,
                'avatar_url' => config('app.url') . '/storage/avatars/personal-image.png',
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
                'images'      => ['pikachu-v-max.jpg', 'carta-trasera.png'],
            ],
            [
                'user_id'     => $user1->id,
                'category_id' => 1,
                'name'        => 'Mewtwo EX Full Art',
                'price'       => 34.50,
                'condition'   => 'usado',
                'description' => 'Mewtwo EX Full Art de Legendary Treasures. Leve desgaste en bordes visible solo de cerca.',
                'images'      => ['mewtwoEx.png', 'carta-trasera.png'],
            ],
            [
                'user_id'     => $user1->id,
                'category_id' => 1,
                'name'        => 'Blastoise Base Set Holo',
                'price'       => 120.00,
                'condition'   => 'usado',
                'description' => 'Blastoise holo de la Base Set original 1999. Desgaste normal por el tiempo.',
                'images'      => ['blastoise.png', 'carta-trasera.png'],
            ],
            [
                'user_id'     => $user1->id,
                'category_id' => 2,
                'name'        => 'Figura Gengar Nendoroid',
                'price'       => 55.00,
                'condition'   => 'nuevo',
                'description' => 'Figura Nendoroid de Gengar en caja original sellada. Importación japonesa directa.',
                'images'      => ['gengar.png'],
            ],
            [
                'user_id'     => $user1->id,
                'category_id' => 2,
                'name'        => 'Figura Snorlax Funko Pop',
                'price'       => 18.99,
                'condition'   => 'casi_nuevo',
                'description' => 'Funko Pop Snorlax #643. Caja en buen estado con leve golpe en esquina.',
                'images'      => ['snorlax.png'],
            ],
            [
                'user_id'     => $user1->id,
                'category_id' => 3,
                'name'        => 'Pokémon Esmeralda GBA',
                'price'       => 75.00,
                'condition'   => 'usado',
                'description' => 'Cartucho original de Pokémon Esmeralda para Game Boy Advance. Batería funcional.',
                'images'      => ['esmeralda.png', 'esmeralda-trasera.png'],
            ],
            [
                'user_id'     => $user1->id,
                'category_id' => 3,
                'name'        => 'Pokémon SoulSilver DS',
                'price'       => 120.00,
                'condition'   => 'casi_nuevo',
                'description' => 'Pokémon SoulSilver para Nintendo DS. Incluye Pokéwalker en caja original.',
                'images'      => ['soulsilver.png'],
            ],
            [
                'user_id'     => $user1->id,
                'category_id' => 4,
                'name'        => 'Peluche Eevee 30cm',
                'price'       => 22.00,
                'condition'   => 'nuevo',
                'description' => 'Peluche oficial de Eevee de 30cm del Centro Pokémon Japón.',
                'images'      => ['evee.jpg'],
            ],
            [
                'user_id'     => $user1->id,
                'category_id' => 5,
                'name'        => 'Caja sellada XY Evoluciones',
                'price'       => 180.00,
                'condition'   => 'nuevo',
                'description' => 'Caja sellada de 36 sobres de la expansión XY Evoluciones. Sin abrir.',
                'images'      => ['pokemon-evolution.png'],
            ],
            [
                'user_id'     => $user2->id,
                'category_id' => 1,
                'name'        => 'Umbreon Prime',
                'price'       => 150.00,
                'condition'   => 'casi_nuevo',
                'description' => 'Carta Umbreon Prime de la expansión HS—Indomable. Una joya para coleccionistas de tipo siniestro. Estado Impecable (NM).',
                'images'      => ['umbreon.png', 'carta-trasera.png'],
            ],
            [
                'user_id'     => $user2->id,
                'category_id' => 1,
                'name'        => 'Rayquaza Star (Gold Star)',
                'price'       => 450.00,
                'condition'   => 'usado',
                'description' => 'Rayquaza Star de la expansión EX Deoxys. Una de las cartas más raras y codiciadas del TCG. El borde tiene un ligero desgaste.',
                'images'      => ['rayquaza.png', 'carta-trasera.png'],
            ],
            [
                'user_id'     => $user2->id,
                'category_id' => 1,
                'name'        => 'Lugia Neo Genesis Holo',
                'price'       => 210.00,
                'condition'   => 'casi_nuevo',
                'description' => 'Lugia Holográfico original de la colección Neo Genesis. El guardián de los mares en su versión más icónica.',
                'images'      => ['lugia.png', 'carta-trasera.png'],
            ],
        ];

        foreach ($products as $data) {
            $imageFiles = $data['images'];
            unset($data['images']);

            $product = Product::firstOrCreate(
                ['name' => $data['name'], 'user_id' => $data['user_id']],
                array_merge($data, ['available' => 'disponible', 'visible' => true])
            );

            if ($product->wasRecentlyCreated) {
                foreach ($imageFiles as $index => $filename) {
                    $sourcePath = $seedImagesPath . '/' . $filename;
                    $storagePath = 'products/' . $filename;

                    Storage::disk('public')->put(
                        $storagePath,
                        file_get_contents($sourcePath)
                    );

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url'  => config('app.url') . '/storage/' . $storagePath,
                        'is_main'    => $index === 0,
                    ]);
                }
            }
        }
    }
}
