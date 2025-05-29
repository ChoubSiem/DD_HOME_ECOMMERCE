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
        Schema::create('uom_transfers', function (Blueprint $table) {
            $table->id();
            $table->dateTime("date");
            $table->foreignId("transfer_user")->constrained("users")->onDelete("cascade");
            $table->foreignId("warehouse_id")->constrained("warehouses")->nullable()->onDelete("cascade");
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('uom_transfers');
    }
};
