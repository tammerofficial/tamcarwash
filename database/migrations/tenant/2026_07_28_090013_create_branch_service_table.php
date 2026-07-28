<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branch_service', function (Blueprint $table) {
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_available')->default(true);
            $table->decimal('custom_price', 12, 3)->nullable();
            $table->unsignedSmallInteger('custom_duration')->nullable();
            $table->timestamps();

            $table->primary(['branch_id', 'service_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_service');
    }
};
