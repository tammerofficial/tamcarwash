<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->decimal('price', 12, 3)->default(0);
            $table->unsignedSmallInteger('duration_minutes')->default(0);
            $table->boolean('vat_included')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['service_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_addons');
    }
};
