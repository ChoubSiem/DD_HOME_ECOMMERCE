<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('close_shift', function (Blueprint $table) {
            $table->id(); // Auto-incrementing primary key
            $table->unsignedBigInteger('user_id'); // Foreign key to users table
            $table->unsignedBigInteger('open_shift_id'); // Foreign key to open_shift table
            $table->timestamp('end_time')->useCurrent(); // Timestamp when the shift is closed
            $table->decimal('final_cash', 10, 2); // Final cash in the register
            $table->decimal('total_sales', 10, 2); // Total sales during the shift
            $table->text('notes')->nullable(); // Optional notes
            $table->timestamps(); // Created at and updated at timestamps

            // Foreign key constraints
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('open_shift_id')->references('id')->on('open_shift')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('close_shift');
    }
};
