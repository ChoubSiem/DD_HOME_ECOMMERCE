<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\softDeletes;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('warehouse_products', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('warehouse_id')->contrained()->onDelete('cascade');
            $table->foreignId('product_id')->contrained()->onDelete('cascade');
            $table->integer('qty');
            $table->float('cost',10,2);
            $table->float('price',10,2);
            $table->boolean('is_active');
            $table->softDeletes('deleted_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_products');
    }
};
