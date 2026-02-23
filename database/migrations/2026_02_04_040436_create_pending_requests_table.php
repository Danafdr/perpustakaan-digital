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
        Schema::create('pending_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['update_profile', 'delete_account']);
            $table->json('data')->nullable(); // For profile updates (new name, etc.)
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('reason')->nullable(); // Rejection reason
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pending_requests');
    }
};
