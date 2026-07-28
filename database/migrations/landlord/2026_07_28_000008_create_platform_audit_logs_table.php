<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('landlord')->create('platform_audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('platform_user_id')->nullable();
            $table->uuid('tenant_id')->nullable();
            $table->string('event');
            $table->string('auditable_type')->nullable();
            $table->uuid('auditable_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('platform_user_id')->references('id')->on('platform_users')->nullOnDelete();
            $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
            $table->index(['tenant_id', 'event', 'created_at']);
            $table->index(['auditable_type', 'auditable_id']);
        });
    }

    public function down(): void
    {
        Schema::connection('landlord')->dropIfExists('platform_audit_logs');
    }
};
