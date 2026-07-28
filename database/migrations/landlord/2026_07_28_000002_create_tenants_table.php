<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('landlord')->create('tenants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('legal_name')->nullable();
            $table->string('tax_number')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('country', 2)->default('SA');
            $table->string('timezone')->default('Asia/Riyadh');
            $table->string('locale', 10)->default('ar');
            $table->string('status')->default('pending');
            $table->uuid('plan_id')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->json('settings')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('plan_id')->references('id')->on('plans')->nullOnDelete();
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::connection('landlord')->dropIfExists('tenants');
    }
};
