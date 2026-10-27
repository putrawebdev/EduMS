<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\ClassMember;
use App\Models\Classroom;
use App\Models\Subject;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LmsCoreTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $teacher;
    protected User $student;
    protected Classroom $classroom;
    protected Subject $subject;
    protected Assignment $assignment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'role' => 'admin',
        ]);

        $this->teacher = User::factory()->create([
            'name' => 'Teacher User',
            'email' => 'teacher@test.com',
            'role' => 'guru',
        ]);

        $this->student = User::factory()->create([
            'name' => 'Student User',
            'email' => 'student@test.com',
            'role' => 'siswa',
        ]);

        $this->classroom = Classroom::create([
            'name' => 'X IPA 1',
            'code' => 'X-IPA-1',
            'teacher_id' => $this->teacher->id,
            'academic_year' => '2025/2026',
            'semester' => 'Ganjil',
            'is_active' => true,
        ]);

        ClassMember::create([
            'class_id' => $this->classroom->id,
            'user_id' => $this->student->id,
            'status' => 'active',
        ]);

        $this->subject = Subject::create([
            'name' => 'Matematika',
            'code' => 'MTK',
            'color' => '#2563EB',
            'icon' => 'Calculator',
        ]);

        $this->assignment = Assignment::create([
            'class_id' => $this->classroom->id,
            'subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
            'title' => 'Latihan Aljabar',
            'instructions' => 'Kerjakan soal latihan nomor 1-5.',
            'due_date' => Carbon::now()->addDays(2),
            'max_score' => 100,
            'allow_late_submission' => true,
            'is_published' => true,
        ]);
    }

    public function test_student_can_view_dashboard(): void
    {
        $response = $this->actingAs($this->student)->get('/dashboard');

        $response->assertStatus(200);
    }

    public function test_teacher_can_view_teacher_dashboard(): void
    {
        $response = $this->actingAs($this->teacher)->get('/dashboard');

        $response->assertStatus(200);
    }

    public function test_teacher_dashboard_only_shows_assigned_subjects_and_assignments(): void
    {
        $otherSubject = Subject::create([
            'name' => 'Bahasa Indonesia',
            'code' => 'IND',
            'color' => '#0D827C',
            'icon' => 'BookOpen',
        ]);
        $this->teacher->subjects()->attach($this->subject->id);

        $otherAssignment = Assignment::create([
            'class_id' => $this->classroom->id,
            'subject_id' => $otherSubject->id,
            'teacher_id' => $this->teacher->id,
            'title' => 'Tugas Bahasa',
            'instructions' => 'Kerjakan soal bahasa.',
            'due_date' => Carbon::now()->addDays(3),
            'max_score' => 100,
            'allow_late_submission' => true,
            'is_published' => true,
        ]);

        $this->actingAs($this->teacher)
            ->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/Dashboard')
                ->has('subjects', 1)
                ->where('subjects.0.id', $this->subject->id)
                ->has('recent_assignments', 1)
                ->where('recent_assignments.0.id', $this->assignment->id)
                ->missing('recent_assignments.1')
            );
    }

    public function test_admin_can_assign_up_to_two_subjects_to_a_teacher(): void
    {
        $secondSubject = Subject::create([
            'name' => 'Bahasa Indonesia',
            'code' => 'IND',
            'color' => '#0D827C',
            'icon' => 'BookOpen',
        ]);

        $this->actingAs($this->admin)->post('/admin/pengguna', [
            'name' => 'Guru Baru',
            'email' => 'guru-baru@test.com',
            'password' => 'password123',
            'role' => 'guru',
            'subject_ids' => [$this->subject->id, $secondSubject->id],
        ])->assertSessionHasNoErrors();

        $newTeacher = User::where('email', 'guru-baru@test.com')->firstOrFail();
        $this->assertCount(2, $newTeacher->subjects);

        $this->actingAs($this->admin)->post('/admin/pengguna', [
            'name' => 'Guru Tiga Mapel',
            'email' => 'guru-tiga@test.com',
            'password' => 'password123',
            'role' => 'guru',
            'subject_ids' => [$this->subject->id, $secondSubject->id, $this->subject->id + 2],
        ])->assertSessionHasErrors('subject_ids');
    }

    public function test_admin_can_view_admin_dashboard(): void
    {
        $response = $this->actingAs($this->admin)->get('/dashboard');

        $response->assertStatus(200);
    }

    public function test_student_cannot_access_admin_user_management(): void
    {
        $response = $this->actingAs($this->student)->get('/admin/pengguna');

        $response->assertStatus(403);
    }

    public function test_admin_can_access_user_management(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/pengguna');

        $response->assertStatus(200);
    }

    public function test_student_can_submit_assignment(): void
    {
        $response = $this->actingAs($this->student)->post("/tugas/{$this->assignment->id}/kumpulkan", [
            'submission_text' => 'Berikut jawaban saya untuk soal latihan aljabar.',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('assignment_submissions', [
            'assignment_id' => $this->assignment->id,
            'user_id' => $this->student->id,
            'submission_text' => 'Berikut jawaban saya untuk soal latihan aljabar.',
        ]);
    }

    public function test_teacher_can_grade_submission(): void
    {
        $submission = AssignmentSubmission::create([
            'assignment_id' => $this->assignment->id,
            'user_id' => $this->student->id,
            'submission_text' => 'Jawaban siswa',
            'submitted_at' => now(),
            'attempt_number' => 1,
        ]);

        $response = $this->actingAs($this->teacher)->post("/pengumpulan/{$submission->id}/nilai", [
            'score' => 95,
            'teacher_feedback' => 'Sangat bagus dan teliti!',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('assignment_submissions', [
            'id' => $submission->id,
            'score' => 95,
            'status' => 'graded',
        ]);
    }

    public function test_push_subscription_endpoint(): void
    {
        $response = $this->actingAs($this->student)->postJson('/api/push-subscribe', [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/fake-test-endpoint',
            'publicKey' => 'fake_public_key_p256dh',
            'authToken' => 'fake_auth_token',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('push_subscriptions', [
            'user_id' => $this->student->id,
        ]);
    }

    public function test_deadline_check_command_runs_successfully(): void
    {
        $this->artisan('eduspace:check-deadlines')
            ->assertExitCode(0);
    }
}
