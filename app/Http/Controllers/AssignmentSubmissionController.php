<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AssignmentSubmissionController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function store(Request $request, Assignment $assignment): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isSiswa()) {
            abort(403, 'Hanya siswa yang dapat mengumpulkan tugas.');
        }

        // Verify class membership
        if (! $assignment->classroom->students()->where('users.id', $user->id)->exists()) {
            abort(403, 'Anda tidak terdaftar di kelas tugas ini.');
        }

        $now = Carbon::now('Asia/Jakarta');
        $isLate = $now->greaterThan($assignment->due_date);

        if ($isLate && ! $assignment->allow_late_submission) {
            return redirect()->back()->with('error', 'Tugas ini telah melewati batas waktu dan tidak menerima pengumpulan terlambat.');
        }

        $validated = $request->validate([
            'submission_text' => ['nullable', 'string'],
            'file' => ['nullable', 'file', 'max:51200'], // max 50MB
        ]);

        if (empty($validated['submission_text']) && ! $request->hasFile('file')) {
            return redirect()->back()->with('error', 'Harap isi teks jawaban atau unggah file lampiran tugas.');
        }

        DB::beginTransaction();
        try {
            // Check existing submission
            $existing = AssignmentSubmission::where('assignment_id', $assignment->id)
                ->where('user_id', $user->id)
                ->latest()
                ->first();

            $attemptNumber = $existing ? ($existing->attempt_number + 1) : 1;

            $filePath = null;
            $fileName = null;
            $fileSize = null;

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = $file->getClientOriginalName();
                $fileSize = $file->getSize();
                $filePath = $file->store('submissions', 'public');
            } elseif ($existing && $existing->file_path) {
                // Keep previous file if re-submitting with just text
                $filePath = $existing->file_path;
                $fileName = $existing->file_name;
                $fileSize = $existing->file_size;
            }

            $submission = AssignmentSubmission::create([
                'assignment_id' => $assignment->id,
                'user_id' => $user->id,
                'status' => $existing ? 'resubmitted' : 'submitted',
                'submission_text' => $validated['submission_text'] ?? null,
                'file_path' => $filePath,
                'file_name' => $fileName,
                'file_size' => $fileSize,
                'submitted_at' => $now,
                'is_late' => $isLate,
                'attempt_number' => $attemptNumber,
            ]);

            DB::commit();

            // 1. Notify Student: Submission confirmed
            $this->notificationService->send(
                $user,
                'submission_received',
                'Pengumpulan Berhasil',
                "Jawaban tugas '{$assignment->title}' berhasil disimpan pada {$now->format('d M Y, H:i')} WIB." . ($isLate ? ' (Status: Terlambat)' : ''),
                "/tugas/{$assignment->id}",
                ['assignment_id' => $assignment->id, 'submission_id' => $submission->id]
            );

            // 2. Notify Teacher: New student submission
            $teacher = $assignment->teacher;
            if ($teacher) {
                $this->notificationService->send(
                    $teacher,
                    'submission_received',
                    "Pengumpulan Tugas: {$assignment->title}",
                    "Siswa {$user->name} ({$assignment->classroom->name}) telah mengumpulkan jawaban tugas." . ($isLate ? ' (Terlambat)' : ''),
                    "/tugas/{$assignment->id}",
                    ['assignment_id' => $assignment->id, 'submission_id' => $submission->id]
                );
            }

            return redirect()->back()->with('success', 'Tugas berhasil dikumpulkan!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menyimpan jawaban: ' . $e->getMessage());
        }
    }

    public function grade(Request $request, AssignmentSubmission $submission): RedirectResponse
    {
        $user = $request->user();
        $assignment = $submission->assignment;

        if (! $user->isAdmin() && ! ($user->isGuru() && $assignment->teacher_id === $user->id)) {
            abort(403, 'Anda tidak memiliki hak akses untuk menilai pengumpulan ini.');
        }

        $validated = $request->validate([
            'score' => ['required', 'numeric', 'min:0', 'max:' . $assignment->max_score],
            'teacher_feedback' => ['nullable', 'string'],
        ]);

        $score = (float) $validated['score'];

        // Apply late penalty if applicable and marked late
        if ($submission->is_late && $assignment->late_penalty_percent > 0) {
            // Optionally note penalty in feedback
            $penaltyAmount = ($score * $assignment->late_penalty_percent) / 100;
            // Keep original score or adjust
        }

        $submission->update([
            'score' => $score,
            'teacher_feedback' => $validated['teacher_feedback'] ?? null,
            'status' => 'graded',
            'graded_at' => now(),
            'graded_by' => $user->id,
        ]);

        // Notify student about grade
        $student = $submission->student;
        if ($student) {
            $this->notificationService->send(
                $student,
                'assignment_graded',
                'Nilai Tugas Sudah Keluar',
                "Tugas '{$assignment->title}' telah dinilai. Skor kamu: {$score}/{$assignment->max_score}.",
                "/tugas/{$assignment->id}",
                ['assignment_id' => $assignment->id, 'score' => $score]
            );
        }

        return redirect()->back()->with('success', "Penilaian untuk {$student->name} berhasil disimpan.");
    }
}

