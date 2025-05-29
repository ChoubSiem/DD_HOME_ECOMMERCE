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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('barcode')->unique()->nullable();
            $table->string('code')->unique();
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('product_group_id')->nullable()->constrained("product_groups")->onDelete('cascade');
            $table->foreignId('brand_id')->nullable()->constrained("brands")->onDelete('cascade');
            $table->decimal('cost', 8, 2)->nullable();
            $table->decimal('price', 8, 2)->nullable();
            $table->text('description')->nullable();
            $table->enum('type', ['low', 'medium', 'high'])->nullable();
            $table->integer('alert_qty')->default(0);
            $table->boolean('is_draft')->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
