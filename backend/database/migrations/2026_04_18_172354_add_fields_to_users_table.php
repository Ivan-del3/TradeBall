<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('rol', ['admin', 'customer'])->default('customer')->after('id');
            $table->string('lastname', 100)->after('name');
            $table->string('number', 20)->nullable()->unique()->after('email');
            $table->string('address', 255)->nullable()->after('number');
            $table->boolean('is_active')->default(true)->after('address');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['rol', 'lastname', 'number', 'address', 'is_active']);
        });
    }
};