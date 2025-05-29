<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductIssuesTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_issues', function (Blueprint $table) {
            $table->id(); 
            $table->dateTime('date'); 
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->onDelete('set null'); 
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('issue_title'); 
            $table->text('issue_description')->nullable(); 
            $table->foreignId('reported_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['open', 'in_progress', 'resolved', 'closed'])->default('open'); 

            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_issues');
    }
}
