<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('queue_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('queue_number');
            $table->date('queue_date');
            $table->string('source', 20)->default('walk_in');
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status', 20)->default('waiting');
            $table->unsignedSmallInteger('estimated_wait_minutes')->nullable();
            $table->unsignedTinyInteger('priority')->default(0);
            $table->timestamp('called_at')->nullable();
            $table->timestamp('arrived_at')->nullable();
            $table->timestamp('in_service_at')->nullable();
            $table->timestamp('ready_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('no_show_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['branch_id', 'queue_date', 'queue_number'], 'queue_entries_branch_date_number_unique');
            $table->index(['branch_id', 'queue_date', 'status']);
            $table->index(['booking_id']);
            $table->index(['order_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('queue_entries');
    }
};
