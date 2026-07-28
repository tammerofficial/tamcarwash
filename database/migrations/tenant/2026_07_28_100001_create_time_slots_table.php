<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('time_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->date('slot_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedSmallInteger('capacity')->default(1);
            $table->unsignedSmallInteger('booked_count')->default(0);
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            $table->unique(['branch_id', 'slot_date', 'start_time'], 'time_slots_branch_date_start_unique');
            $table->index(['branch_id', 'slot_date', 'is_available']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('time_slots');
    }
};
