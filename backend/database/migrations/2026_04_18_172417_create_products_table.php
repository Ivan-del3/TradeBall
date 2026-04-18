<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('restrict');
            $table->foreignId('category_id')->constrained()->onDelete('restrict');
            $table->string('name', 150);
            $table->decimal('price', 10, 2);
            $table->enum('condition', ['nuevo', 'casi_nuevo', 'usado']);
            $table->text('description')->nullable();
            $table->enum('available', ['disponible', 'reservado', 'vendido'])->default('disponible');
            $table->boolean('visible')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};