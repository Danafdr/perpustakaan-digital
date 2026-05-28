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
        Schema::table('books', function (Blueprint $table) {
            $table->string('isbn')->nullable();
            $table->string('genre')->nullable();
            $table->text('description')->nullable();
            $table->string('cover_image_path')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_type')->nullable(); // 'pdf', 'epub', 'audio'
            $table->integer('max_concurrent_loans')->default(3);
            $table->boolean('is_historical_archive')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn([
                'isbn',
                'genre',
                'description',
                'cover_image_path',
                'file_path',
                'file_type',
                'max_concurrent_loans',
                'is_historical_archive'
            ]);
        });
    }
};
