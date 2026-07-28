<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branch_holidays', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->string('name');
            $table->boolean('is_closed')->default(true);
            $table->timestamps();

            $table->unique(['branch_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_holidays');
    }
};
