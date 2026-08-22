<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create FAQs table
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->text('question_ar');
            $table->text('question_en');
            $table->longText('answer_ar');
            $table->longText('answer_en');
            $table->string('category')->default('other');
            $table->integer('order')->default(0);
            $table->integer('helpful_count')->default(0);
            $table->integer('not_helpful_count')->default(0);
            $table->integer('views')->default(0);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->index('category');
            $table->index('is_active');
        });

        // Create Support Tickets table
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('user_name');
            $table->string('user_email');
            $table->string('user_phone');
            $table->string('subject');
            $table->longText('description');
            $table->string('category')->default('other');
            $table->string('priority')->default('medium');
            $table->string('status')->default('open');
            $table->string('assigned_to')->nullable();
            $table->longText('resolution_notes')->nullable();
            $table->dateTime('resolved_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('ticket_number');
            $table->index('status');
            $table->index('priority');
            $table->index('category');
            $table->index('user_email');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });

        // Create Announcements table
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title_ar');
            $table->string('title_en');
            $table->longText('content_ar');
            $table->longText('content_en');
            $table->string('type')->default('update');
            $table->string('priority')->default('medium');
            $table->dateTime('published_at')->nullable();
            $table->dateTime('expires_at')->nullable();
            $table->string('target_role')->default('all');
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->index('type');
            $table->index('target_role');
            $table->index('is_active');
            $table->index('published_at');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('support_tickets');
        Schema::dropIfExists('faqs');
    }
};
