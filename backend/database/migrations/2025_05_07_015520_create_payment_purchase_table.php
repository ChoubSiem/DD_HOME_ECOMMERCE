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
        Schema::create('payment_purchase', function (Blueprint $table) {
            $table->id();
            $table->foreignId("purchase_id")->constrained("purchases")->onDelete("cascade");
            $table->decimal('amount_paid', 10, 2)->nullable(); // optional extra column
            $table->timestamps();


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_purchase');
    }
};
