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
        Schema::create('our_standards', function (Blueprint $table) {
           $table->id('our_id');
            $table->string('home_page', 255)->nullable();
            $table->string('standard_category', 255);
            $table->string('standard_file')->nullable();
            $table->string('weblink')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('our_standards');
    }
};
