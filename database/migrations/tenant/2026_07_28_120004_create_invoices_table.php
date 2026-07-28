<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 32)->unique();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('status', 20)->default('issued');
            $table->string('payment_status', 20)->default('unpaid');
            $table->date('issue_date');
            $table->date('due_date')->nullable();
            $table->decimal('subtotal', 12, 3)->default(0);
            $table->decimal('discount_amount', 12, 3)->default(0);
            $table->decimal('vat_rate', 5, 2)->default(5.00);
            $table->decimal('vat_amount', 12, 3)->default(0);
            $table->decimal('total', 12, 3)->default(0);
            $table->boolean('is_tax_exempt')->default(false);
            $table->boolean('tax_inclusive')->default(false);
            $table->string('vatin', 32)->nullable();
            $table->string('cr_number', 32)->nullable();
            $table->string('customer_name')->nullable();
            $table->string('customer_phone', 20)->nullable();
            $table->string('customer_email')->nullable();
            $table->text('qr_payload')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['branch_id', 'issue_date']);
            $table->index(['branch_id', 'status']);
            $table->index(['customer_id']);
            $table->index(['payment_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
