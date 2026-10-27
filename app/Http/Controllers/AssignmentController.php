<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Classroom;
use App\Models\Subject;
use App\Models\User;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $now = Carbon::now('Asia/Jakarta');

        $query = Assignment::with(['classroom', 'subject', 'teacher'])
            ->where('is_published', true);

        if ($user->isSiswa()) {
            $enrolledClassIds = $user->enrolledClasses()->pluck('classes.id')->toArray();
            $query->whereIn('class_id', $enrolledClassIds);
        } elseif ($user->isGuru()) {
            $query->where(function ($q) use ($user) {
                $q->where('teacher_id', $user->id)
                  ->orWhereHas('classroom.classSubjects', function ($sq) use ($user) {
                      $sq->where('teacher_id', $user->id);
                  });
            });
        }

        if ($request->has('subject_id') && $request->subject_id) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('instructions', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status) {
            // Filter by submission status for student
        }

        $assignments = $query->orderBy('due_date', 'asc')->paginate(12)->withQueryString();

        // Attach student's submission info
        if ($user->isSiswa()) {
            $submissions = AssignmentSubmission::where('user_id', $user->id)
                ->whereIn('assignment_id', $assignments->pluck('id'))
                ->get()
                ->keyBy('assignment_id');

            $assignments->getCollection()->transform(function ($assignment) use ($submissions, $now) {
                $sub = $submissions->get($assignment->id);
                $hasSubmitted = $sub && in_array($sub->status, ['submitted', 'graded', 'resubmitted']);
                $isOverdue = ! $hasSubmitted && $now->greaterThan($assignment->due_date);

                if ($hasSubmitted) {
                    $status = 'Sudah Dikumpulkan';
                    $statusType = 'success';
                } elseif ($sub && $sub->status === 'draft') {
                    $status = 'Sedang Dikerjakan';
                    $statusType = 'warning';
                } elseif ($isOverdue) {
                    $status = 'Terlambat';
                    $statusType = 'danger';
                } else {
                    $status = 'Belum Dikerjakan';
                    $statusType = 'danger';
                }

                $assignment->student_status = $status;
                $assignment->student_status_type = $statusType;
                $assignment->student_submission = $sub;
                return $assignment;
            });
        } else {
            // For teacher: count submissions
            $assignments->getCollection()->transform(function ($assignment) {
                $assignment->submissions_count = $assignment->submissions()->count();
                $assignment->graded_count = $assignment->submissions()->where('status', 'graded')->count();
                return $assignment;
            });
        }

        $subjects = Subject::all();
        $classes = $user->isSiswa() ? $user->enrolledClasses : Classroom::where('is_active', true)->get();

        return Inertia::render('Assignment/Index', [
            'assignments' => $assignments,
            'subjects' => $subjects,
            'classes' => $classes,
            'filters' => $request->only(['subject_id', 'class_id', 'status', 'search']),
        ]);
    }

    public function show(Request $request, Assignment $assignment): Response
    {
        $user = $request->user();
        $now = Carbon::now('Asia/Jakarta');

        $assignment->load(['classroom.students', 'subject', 'teacher']);

        $mySubmission = null;
        $allSubmissions = [];

        if ($user->isSiswa()) {
            // Check student access
            if (! $assignment->classroom->students()->where('users.id', $user->id)->exists()) {
                abort(403, 'Anda tidak terdaftar dalam kelas tugas ini.');
            }

            $mySubmission = AssignmentSubmission::where('assignment_id', $assignment->id)
                ->where('user_id', $user->id)
                ->latest()
                ->first();
        } else {
            // Teacher / Admin: load all submissions with student info
            $allSubmissions = AssignmentSubmission::where('assignment_id', $assignment->id)
                ->with(['student', 'grader'])
                ->latest('submitted_at')
                ->get();
        }

        $isOverdue = $now->greaterThan($assignment->due_date);

        return Inertia::render('Assignment/Show', [
            'assignment' => $assignment,
            'mySubmission' => $mySubmission,
            'allSubmissions' => $allSubmissions,
            'isOverdue' => $isOverdue,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! $user->isGuru()) {
            abort(403);
        }

        $validated = $request->validate([
            'class_id' => ['required', 'exists:classes,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'title' => ['required', 'string', 'max:255'],
            'instructions' => ['required', 'string'],
            'due_date' => ['required', 'date'],
            'start_date' => ['nullable', 'date'],
            'max_score' => ['required', 'integer', 'min:1', 'max:100'],
            'allow_late_submission' => ['boolean'],
            'late_penalty_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'file' => ['nullable', 'file', 'max:25600'],
        ]);

        $attachmentPath = null;
        $attachmentName = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $attachmentName = $file->getClientOriginalName();
            $attachmentPath = $file->store('assignments', 'public');
        }

        $assignment = Assignment::create([
            'class_id' => $validated['class_id'],
            'subject_id' => $validated['subject_id'],
            'teacher_id' => $user->id,
            'title' => $validated['title'],
            'instructions' => $validated['instructions'],
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,
            'start_date' => $validated['start_date'] ?? now(),
            'due_date' => Carbon::parse($validated['due_date'], 'Asia/Jakarta'),
            'max_score' => $validated['max_score'],
            'allow_late_submission' => $validated['allow_late_submission'] ?? true,
            'late_penalty_percent' => $validated['late_penalty_percent'] ?? 0,
            'is_published' => true,
        ]);

        // Send notification to all students in the class
        $this->notificationService->sendToClass(
            $assignment->class_id,
            'new_assignment',
            "Tugas Baru: {$assignment->title}",
            "Guru pengampu telah mempublikasikan tugas baru untuk mata pelajaran {$assignment->subject->name}. Batas waktu: {$assignment->due_date->format('d M Y, H:i')} WIB.",
            "/tugas/{$assignment->id}",
            ['assignment_id' => $assignment->id]
        );

        return redirect()->route('assignments.show', $assignment->id)
            ->with('success', 'Tugas berhasil dibuat dan notifikasi dikirimkan ke siswa.');
    }

    public function update(Request $request, Assignment $assignment): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! ($user->isGuru() && $assignment->teacher_id === $user->id)) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'instructions' => ['required', 'string'],
            'due_date' => ['required', 'date'],
            'max_score' => ['required', 'integer', 'min:1', 'max:100'],
            'allow_late_submission' => ['boolean'],
            'late_penalty_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'file' => ['nullable', 'file', 'max:25600'],
        ]);

        if ($request->hasFile('file')) {
            if ($assignment->attachment_path && Storage::disk('public')->exists($assignment->attachment_path)) {
                Storage::disk('public')->delete($assignment->attachment_path);
            }
            $file = $request->file('file');
            $validated['attachment_name'] = $file->getClientOriginalName();
            $validated['attachment_path'] = $file->store('assignments', 'public');
        }

        $validated['due_date'] = Carbon::parse($validated['due_date'], 'Asia/Jakarta');

        $assignment->update($validated);

        return redirect()->back()->with('success', 'Tugas berhasil diperbarui.');
    }

    public function extendDeadline(Request $request, Assignment $assignment): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! ($user->isGuru() && $assignment->teacher_id === $user->id)) {
            abort(403);
        }

        $validated = $request->validate([
            'due_date' => ['required', 'date', 'after:now'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $newDueDate = Carbon::parse($validated['due_date'], 'Asia/Jakarta');
        $oldDueDate = $assignment->due_date;

        $assignment->update([
            'due_date' => $newDueDate,
        ]);

        // Notify class about extended deadline
        $this->notificationService->sendToClass(
            $assignment->class_id,
            'deadline_extended',
            "Tenggat Tugas Diperpanjang: {$assignment->title}",
            "Batas waktu tugas diperpanjang hingga {$newDueDate->format('d M Y, H:i')} WIB. " . ($validated['reason'] ? "Alasan: {$validated['reason']}" : ''),
            "/tugas/{$assignment->id}",
            ['assignment_id' => $assignment->id]
        );

        return redirect()->back()->with('success', 'Batas waktu tugas berhasil diperpanjang dan notifikasi telah dikirim.');
    }

    public function destroy(Request $request, Assignment $assignment): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! ($user->isGuru() && $assignment->teacher_id === $user->id)) {
            abort(403);
        }

        if ($assignment->attachment_path && Storage::disk('public')->exists($assignment->attachment_path)) {
            Storage::disk('public')->delete($assignment->attachment_path);
        }

        $assignment->delete();

        return redirect()->route('assignments.index')->with('success', 'Tugas berhasil dihapus.');
    }
}
