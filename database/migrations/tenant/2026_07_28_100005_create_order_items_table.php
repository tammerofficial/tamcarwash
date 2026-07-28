<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('service_id')->nullable();
            $table->unsignedBigInteger('addon_id')->nullable();
            $table->string('item_type', 20);
            $table->string('name');
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->decimal('unit_price', 12, 3)->default(0);
            $table->decimal('discount_amount', 12, 3)->default(0);
            $table->decimal('tax_amount', 12, 3)->default(0);
            $table->decimal('total_price', 12, 3)->default(0);
            $table->foreignId('worker_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('pending');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['order_id']);
            $table->index(['service_id']);
            $table->index(['addon_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
