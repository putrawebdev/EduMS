<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['teacher_id', 'subject_id']);
        });

        $assignments = DB::table('class_subjects')
            ->selectRaw('class_subjects.teacher_id, class_subjects.subject_id, MIN(class_subjects.created_at) as created_at, MAX(class_subjects.updated_at) as updated_at')
            ->join('users', 'users.id', '=', 'class_subjects.teacher_id')
            ->where('users.role', 'guru')
            ->groupBy('class_subjects.teacher_id', 'class_subjects.subject_id')
            ->orderBy('class_subjects.teacher_id')
            ->orderBy('class_subjects.subject_id')
            ->get()
            ->groupBy('teacher_id')
            ->flatMap(fn ($subjects) => $subjects->take(2))
            ->map(fn ($assignment) => (array) $assignment)
            ->values()
            ->all();

        if ($assignments !== []) {
            DB::table('teacher_subjects')->insert($assignments);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_subjects');
    }
};
