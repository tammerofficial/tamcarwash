<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_number', 32)->unique();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('time_slot_id')->nullable()->constrained()->nullOnDelete();
            $table->date('scheduled_date');
            $table->time('scheduled_start_time');
            $table->time('scheduled_end_time');
            $table->string('status', 20)->default('pending');
            $table->string('source', 20)->default('online');
            $table->text('notes')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->json('service_ids')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['branch_id', 'scheduled_date', 'status']);
            $table->index(['customer_id', 'status']);
            $table->index(['scheduled_date', 'scheduled_start_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
