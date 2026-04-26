<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->boolean('hidden_by_buyer')->default(false)->after('escrow_active');
            $table->boolean('hidden_by_seller')->default(false)->after('hidden_by_buyer');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['hidden_by_buyer', 'hidden_by_seller']);
        });
    }
};
