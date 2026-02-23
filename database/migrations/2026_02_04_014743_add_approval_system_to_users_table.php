<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Approval status - default false for students, will be true for admin
            $table->boolean('is_approved')->default(false)->after('role');
            
            // Audit trail - who approved and when
            $table->unsignedBigInteger('approved_by')->nullable()->after('is_approved');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            
            // Foreign key for approved_by (references users.id for admin who approved)
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
        });

        // Auto-approve existing users (especially admin)
        DB::table('users')->update(['is_approved' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['is_approved', 'approved_by', 'approved_at']);
        });
    }
};
