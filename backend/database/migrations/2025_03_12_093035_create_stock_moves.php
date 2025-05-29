<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_moves', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained()->onDelete('cascade');
                $table->foreignId('warehouse_id')->nullable()->constrained()->onDelete('set null');
                $table->enum('type', ['in', 'out']); // stock_in or stock_out
                $table->integer('quantity');
                $table->dateTime('date');
                $table->string('reason')->nullable(); // 'purchase', 'sale', 'adjustment', etc.
                $table->string('base_unit');
                $table->integer('base_qty');
                $table->timestamps();
            });
            
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_moves');
    }
};
