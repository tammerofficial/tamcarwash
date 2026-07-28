<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_consumables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('quantity', 10, 3)->default(1);
            $table->string('unit', 20)->default('unit');
            $table->timestamps();

            $table->index(['service_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_consumables');
    }
};
