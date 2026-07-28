<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tax_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('vat_enabled')->default(true);
            $table->decimal('vat_rate', 5, 2)->default(5.00);
            $table->boolean('prices_tax_inclusive')->default(false);
            $table->string('vatin', 32)->nullable();
            $table->string('cr_number', 32)->nullable();
            $table->string('legal_name_ar')->nullable();
            $table->string('legal_name_en')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });

        Schema::create('invoice_settings', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_prefix', 16)->default('INV');
            $table->unsignedBigInteger('next_number')->default(1);
            $table->unsignedSmallInteger('number_padding')->default(6);
            $table->text('footer_text_ar')->nullable();
            $table->text('footer_text_en')->nullable();
            $table->boolean('show_qr_code')->default(true);
            $table->timestamps();
        });

        Schema::create('queue_settings', function (Blueprint $table) {
            $table->id();
            $table->string('queue_prefix', 8)->default('Q');
            $table->unsignedInteger('daily_reset_number')->default(1);
            $table->unsignedSmallInteger('estimated_minutes_per_vehicle')->default(20);
            $table->boolean('announce_voice_enabled')->default(true);
            $table->boolean('show_estimated_wait')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('queue_settings');
        Schema::dropIfExists('invoice_settings');
        Schema::dropIfExists('tax_settings');
    }
};
