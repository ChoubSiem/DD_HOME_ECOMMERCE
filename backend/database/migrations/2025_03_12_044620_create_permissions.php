<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
// use Illuminate\Support\Facades\SoftDeletes;

return new class extends Migration
{
    
    /**
     * Run the migrations.
     */
    
    public function up(): void
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('group')->nullable();
            $table->string('is_menu_web')->nullable();
            $table->string('web_route_key')->nullable();
            // $table->SoftDeletes('deleted_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */

    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};
