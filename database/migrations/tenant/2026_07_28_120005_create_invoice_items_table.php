<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->string('item_type', 20)->default('service');
            $table->unsignedBigInteger('item_id')->nullable();
            $table->string('description');
            $table->decimal('quantity', 8, 2)->default(1);
            $table->decimal('unit_price', 12, 3)->default(0);
            $table->decimal('discount_amount', 12, 3)->default(0);
            $table->decimal('subtotal', 12, 3)->default(0);
            $table->decimal('vat_rate', 5, 2)->default(5.00);
            $table->decimal('vat_amount', 12, 3)->default(0);
            $table->decimal('total', 12, 3)->default(0);
            $table->boolean('is_tax_exempt')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['invoice_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
