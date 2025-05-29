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
        Schema::create('uom_transfer_items', function (Blueprint $table) {
            $table->id();
            $table->double('qoh');
            $table->foreignId("uom_tranfer_id")->constrained("uom_transfers")->onDelete("cascade");                   
            $table->double('source_qty');              
            $table->unsignedBigInteger('source_unit_id');
            
            $table->unsignedBigInteger('destination_product_id');
            $table->double('destination_qty');         
            $table->double('source_after');          
            $table->unsignedBigInteger('destination_unit_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('uom_transfer_items');
    }
};
