<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_vehicle_type_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->string('vehicle_type', 20);
            $table->decimal('price', 12, 3);
            $table->timestamps();

            $table->unique(['service_id', 'vehicle_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_vehicle_type_prices');
    }
};
