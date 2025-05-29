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
        Schema::create('adjustment_items', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('adjustment_id')->constrained()->onDelete('cascade');
            $table->integer('qty');
            $table->string('unit')->nullable();
            $table->string('operation');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adjustment_items');
    }
};
