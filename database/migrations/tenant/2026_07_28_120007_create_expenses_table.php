<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('category', 64);
            $table->string('description');
            $table->decimal('amount', 12, 3);
            $table->decimal('vat_amount', 12, 3)->default(0);
            $table->decimal('vat_rate', 5, 2)->default(5.00);
            $table->boolean('is_vat_recoverable')->default(true);
            $table->date('expense_date');
            $table->string('reference_number', 64)->nullable();
            $table->string('vendor_name')->nullable();
            $table->string('status', 20)->default('approved');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['branch_id', 'expense_date']);
            $table->index(['category']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
