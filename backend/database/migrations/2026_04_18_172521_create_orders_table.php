<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buyer_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('seller_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('product_id')->constrained()->onDelete('restrict')->unique();
            $table->decimal('purchase_price', 10, 2);
            $table->enum('status', ['pendiente', 'completado', 'cancelado'])->default('pendiente');
            $table->boolean('escrow_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};