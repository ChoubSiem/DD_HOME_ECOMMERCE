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
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('username');
            $table->string('gender')->nullable();
            $table->string('customer_code')->nullable();
            $table->string('phone')->nullable()->uniqid();
            $table->integer('recovery_number')->nullable();
            $table->string('province')->nullable();
            $table->string('type')->default('employee');
            $table->string('profile')->nullable();
            $table->string('password');
            $table->unsignedBigInteger('user_group_id')->nullable();
            $table->foreign('user_group_id')->references('id')->on('user_groups')->onDelete('cascade');            
            $table->string('remember_token')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
