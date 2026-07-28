<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->string('plate_number', 20)->unique();
            $table->string('brand', 50)->nullable();
            $table->string('model', 50)->nullable();
            $table->string('color', 30)->nullable();
            $table->string('vehicle_type', 20)->default('sedan');
            $table->unsignedSmallInteger('year')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['customer_id']);
            $table->index(['company_id']);
            $table->index(['vehicle_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
