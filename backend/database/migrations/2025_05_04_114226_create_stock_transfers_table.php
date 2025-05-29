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
        Schema::create('stock_transfers', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('from_warehouse_id')->constrained('warehouses')->nullable()->onDelete('cascade');
            $table->foreignId('to_warehouse_id')->constrained('warehouses')->nullable()->onDelete('cascade');
            
            $table->string('reference_no')->nullable(); // Fix: use 'reference_no', not 'reference' if needed
            $table->dateTime('transfer_date');
            
            $table->foreignId('transfer_user')->constrained('users')->onDelete('cascade');
            
            $table->string('status')->default('pending');
            
            $table->timestamps(); // created_at and updated_at added automatically
            $table->text('note')->nullable();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_transfers');
    }
};
