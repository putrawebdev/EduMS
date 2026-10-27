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
        // 1. Classes / Classrooms
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "X IPA 1"
            $table->string('code')->unique(); // e.g. "X-IPA-1"
            $table->text('description')->nullable();
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete(); // wali kelas
            $table->string('academic_year', 20)->default('2025/2026');
            $table->string('semester', 20)->default('Ganjil');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Class Members (Students in Class)
        Schema::create('class_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 20)->default('active'); // active, inactive
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamps();

            $table->unique(['class_id', 'user_id']);
        });

        // 3. Subjects (Mata Pelajaran)
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. Matematika, Pemrograman Dasar
            $table->string('code')->unique(); // e.g. MTK, PROG
            $table->string('color', 30)->default('#0D827C');
            $table->string('icon', 50)->default('BookOpen'); // Lucide icon name
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 4. Class Subject Teachers (Assign Subject to Class & Teacher)
        Schema::create('class_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['class_id', 'subject_id', 'teacher_id']);
        });

        // 5. Learning Materials (Materi Pembelajaran)
        Schema::create('learning_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('file_type', 50)->nullable();
            $table->text('external_url')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        // 6. Material Progress (Progres Belajar Siswa)
        Schema::create('material_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_material_id')->constrained('learning_materials')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('is_completed')->default(true);
            $table->timestamp('completed_at')->useCurrent();
            $table->timestamps();

            $table->unique(['learning_material_id', 'user_id']);
        });

        // 7. Assignments (Tugas)
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('instructions');
            $table->string('attachment_path')->nullable();
            $table->string('attachment_name')->nullable();
            $table->timestamp('start_date')->nullable();
            $table->timestamp('due_date')->nullable();
            $table->integer('max_score')->default(100);
            $table->boolean('allow_late_submission')->default(true);
            $table->integer('late_penalty_percent')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        // 8. Assignment Submissions (Pengumpulan Tugas)
        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 30)->default('submitted'); // submitted, graded, resubmitted
            $table->text('submission_text')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->boolean('is_late')->default(false);
            $table->decimal('score', 5, 2)->nullable();
            $table->text('teacher_feedback')->nullable();
            $table->timestamp('graded_at')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('attempt_number')->default(1);
            $table->timestamps();

            $table->unique(
                ['assignment_id', 'user_id', 'attempt_number'],
                'as_attempt_unique'
            );
        });

        // 9. Schedules (Jadwal Pelajaran)
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week'); // 1 = Senin, ..., 7 = Minggu
            $table->time('start_time');
            $table->time('end_time');
            $table->string('room', 50)->nullable();
            $table->timestamps();
        });

        // 10. Announcements (Pengumuman)
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('class_id')->nullable()->constrained('classes')->cascadeOnDelete();
            $table->string('title');
            $table->text('content');
            $table->boolean('is_pinned')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        // 11. In-App Notifications
        Schema::create('app_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 60); // e.g. new_assignment, due_soon, graded, etc.
            $table->string('title');
            $table->text('message');
            $table->string('url')->nullable();
            $table->json('data')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_read']);
        });

        // 12. Notification Preferences
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->boolean('new_assignment')->default(true);
            $table->boolean('due_soon')->default(true);
            $table->boolean('deadline_arrived')->default(true);
            $table->boolean('deadline_extended')->default(true);
            $table->boolean('submission_received')->default(true);
            $table->boolean('assignment_graded')->default(true);
            $table->boolean('new_announcement')->default(true);
            $table->boolean('overdue_reminder')->default(true);
            $table->boolean('web_push')->default(true);
            $table->timestamps();
        });

        // 13. Push Subscriptions (Web Push VAPID)
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('endpoint');
            $table->string('endpoint_hash', 64)->index();
            $table->text('public_key'); // p256dh
            $table->text('auth_token');  // auth
            $table->string('content_encoding', 20)->default('aesgcm');
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'endpoint_hash']);
        });

        // 14. Notification Delivery Logs & Idempotency
        Schema::create('notification_delivery_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('notification_type', 60);
            $table->string('channel', 30); // in_app, web_push
            $table->string('status', 30);  // sent, failed, skipped
            $table->string('idempotency_key', 128)->nullable()->index();
            $table->text('error_message')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });

        // 15. Audit Logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 60);
            $table->string('auditable_type')->nullable();
            $table->unsignedBigInteger('auditable_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['auditable_type', 'auditable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('notification_delivery_logs');
        Schema::dropIfExists('push_subscriptions');
        Schema::dropIfExists('notification_preferences');
        Schema::dropIfExists('app_notifications');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('schedules');
        Schema::dropIfExists('assignment_submissions');
        Schema::dropIfExists('assignments');
        Schema::dropIfExists('material_progress');
        Schema::dropIfExists('learning_materials');
        Schema::dropIfExists('class_subjects');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('class_members');
        Schema::dropIfExists('classes');
    }
};

