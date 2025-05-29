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
        Schema::create('adjustments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->dateTime('date');
            $table->string('reference')->nullable();
            $table->foreignId('warehouse_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('adjuster')->nullable()->constrained("users")->onDelete('cascade');
            $table->text('note')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adjustments');
    }
};
