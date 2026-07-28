<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone', 20)->unique();
            $table->string('email')->nullable();
            $table->string('status', 20)->default('active');
            $table->integer('loyalty_points_balance')->default(0);
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('blacklisted_at')->nullable();
            $table->text('blacklist_reason')->nullable();
            $table->timestamps();

            $table->index(['status']);
            $table->index(['company_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
