<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('peak_hour_pricing', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week');
            $table->time('starts_at');
            $table->time('ends_at');
            $table->decimal('surcharge_percent', 5, 2)->nullable();
            $table->decimal('surcharge_fixed', 12, 3)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['branch_id', 'day_of_week', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('peak_hour_pricing');
    }
};
