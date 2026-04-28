<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        $indexes = collect(DB::select("SHOW INDEX FROM orders WHERE Key_name = 'orders_product_id_unique'"));
        if ($indexes->isNotEmpty()) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropUnique(['product_id']);
            });
        }
    }

    public function down(): void {}

};
