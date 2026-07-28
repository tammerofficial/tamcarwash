<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('landlord')->create('tenant_databases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->unique();
            $table->string('database_name');
            $table->string('host')->nullable();
            $table->unsignedSmallInteger('port')->nullable();
            $table->string('username')->nullable();
            $table->text('password')->nullable();
            $table->string('connection_name')->default('tenant');
            $table->string('status')->default('pending');
            $table->timestamp('provisioned_at')->nullable();
            $table->unsignedInteger('migration_batch')->default(0);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->unique('database_name');
        });
    }

    public function down(): void
    {
        Schema::connection('landlord')->dropIfExists('tenant_databases');
    }
};
