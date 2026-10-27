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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('siswa')->after('password'); // admin, guru, siswa
            $table->string('nip_nisn', 50)->nullable()->after('role');
            $table->string('phone', 30)->nullable()->after('nip_nisn');
            $table->string('avatar', 255)->nullable()->after('phone');
            $table->text('bio')->nullable()->after('avatar');
            $table->string('grade_level', 50)->nullable()->after('bio'); // e.g. "Kelas 10", "X IPA 1"
            $table->boolean('is_active')->default(true)->after('grade_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'nip_nisn', 'phone', 'avatar', 'bio', 'grade_level', 'is_active']);
        });
    }
};

