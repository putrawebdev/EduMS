<?php

namespace App\Console\Commands;

use App\Models\Assignment;
use App\Models\NotificationDeliveryLog;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CheckAssignmentDeadlinesCommand extends Command
{
    protected $signature = 'eduspace:check-deadlines';
    protected $description = 'Periksa tenggat waktu tugas dan kirimkan pengingat notifikasi otomatis kepada siswa';

    public function handle(NotificationService $notificationService): int
    {
        $now = Carbon::now('Asia/Jakarta');
        $this->info("Menjalankan pemeriksaan tenggat tugas pada {$now->toDateTimeString()} WIB");

        // 1. Remind assignments due within 24 hours (H-1)
        $in24Hours = (clone $now)->addHours(24);
        $dueSoonAssignments = Assignment::with(['classroom.students', 'subject', 'submissions'])
            ->where('is_published', true)
            ->where('due_date', '>', $now)
            ->where('due_date', '<=', $in24Hours)
            ->get();

        $reminderCount = 0;
        foreach ($dueSoonAssignments as $assignment) {
            foreach ($assignment->classroom->students as $student) {
                // Check if already submitted
                $hasSubmitted = $assignment->submissions->where('user_id', $student->id)->isNotEmpty();
                if ($hasSubmitted) {
                    continue;
                }

                $idempotencyKey = "due_soon_{$assignment->id}_{$student->id}_" . $assignment->due_date->format('Ymd');
                $alreadyLogged = NotificationDeliveryLog::where('idempotency_key', $idempotencyKey)->exists();
                if ($alreadyLogged) {
                    continue;
                }

                $hoursLeft = round($now->diffInHours($assignment->due_date, false));
                $timeText = $hoursLeft > 0 ? "Tinggal {$hoursLeft} jam lagi" : "Segera berakhir hari ini";

                $notificationService->send(
                    $student,
                    'due_soon',
                    "Pengingat Deadline: {$assignment->title}",
                    "{$timeText} ({$assignment->subject->name}). Jangan lupa kumpulkan sebelum {$assignment->due_date->format('d M Y, H:i')} WIB.",
                    "/tugas/{$assignment->id}",
                    ['assignment_id' => $assignment->id],
                    $idempotencyKey
                );
                $reminderCount++;
            }
        }

        // 2. Overdue assignments reminder (tugas terlambat)
        $recentlyOverdue = Assignment::with(['classroom.students', 'subject', 'submissions'])
            ->where('is_published', true)
            ->where('due_date', '<', $now)
            ->where('due_date', '>=', (clone $now)->subDays(3))
            ->get();

        $overdueCount = 0;
        foreach ($recentlyOverdue as $assignment) {
            foreach ($assignment->classroom->students as $student) {
                $hasSubmitted = $assignment->submissions->where('user_id', $student->id)->isNotEmpty();
                if ($hasSubmitted) {
                    continue;
                }

                $idempotencyKey = "overdue_{$assignment->id}_{$student->id}_" . $assignment->due_date->format('Ymd');
                $alreadyLogged = NotificationDeliveryLog::where('idempotency_key', $idempotencyKey)->exists();
                if ($alreadyLogged) {
                    continue;
                }

                $notificationService->send(
                    $student,
                    'overdue_reminder',
                    "Tugas Terlambat: {$assignment->title}",
                    "Batas waktu tugas {$assignment->subject->name} telah lewat ({$assignment->due_date->format('d M, H:i')} WIB). Segera hubungi guru pengampu atau kumpulkan jika diizinkan.",
                    "/tugas/{$assignment->id}",
                    ['assignment_id' => $assignment->id],
                    $idempotencyKey
                );
                $overdueCount++;
            }
        }

        $this->info("Pemeriksaan selesai. Dikirim: {$reminderCount} pengingat mendekati tenggat, {$overdueCount} peringatan terlambat.");
        return Command::SUCCESS;
    }
}

