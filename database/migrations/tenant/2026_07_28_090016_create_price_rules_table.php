<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('price_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('rule_type', 30);
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();
            $table->string('vehicle_type', 20)->nullable();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('subscription_plan_id')->nullable();
            $table->decimal('price', 12, 3)->nullable();
            $table->decimal('discount_percent', 5, 2)->nullable();
            $table->unsignedSmallInteger('priority')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['rule_type', 'is_active']);
            $table->index(['branch_id', 'service_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_rules');
    }
};
