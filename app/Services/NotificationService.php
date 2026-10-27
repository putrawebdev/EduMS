<?php

namespace App\Services;

use App\Jobs\SendPushNotificationJob;
use App\Models\AppNotification;
use App\Models\NotificationPreference;
use App\Models\User;

class NotificationService
{
    /**
     * Send an in-app notification and dispatch a Web Push job if enabled.
     */
    public function send(
        User $user,
        string $type,
        string $title,
        string $message,
        ?string $url = null,
        ?array $data = null,
        ?string $idempotencyKey = null
    ): ?AppNotification {
        $pref = $user->notificationPreference ?: NotificationPreference::firstOrCreate(['user_id' => $user->id]);

        // Check if user has muted this type of notification
        if ($this->isTypeDisabledByPreference($pref, $type)) {
            return null;
        }

        // Create In-App Notification
        $notification = AppNotification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'url' => $url,
            'data' => $data ?: [],
            'is_read' => false,
        ]);

        // If Web Push is enabled in preferences and user has push subscriptions, dispatch push job
        if ($pref->web_push && $user->pushSubscriptions()->exists()) {
            SendPushNotificationJob::dispatch(
                $user->id,
                $title,
                $message,
                $url,
                $type,
                $idempotencyKey ?: ('notif_' . $notification->id . '_' . time())
            );
        }

        return $notification;
    }

    /**
     * Send notification to all students in a class.
     */
    public function sendToClass(
        int $classId,
        string $type,
        string $title,
        string $message,
        ?string $url = null,
        ?array $data = null
    ): void {
        $students = User::whereHas('enrolledClasses', function ($q) use ($classId) {
            $q->where('classes.id', $classId);
        })->get();

        foreach ($students as $student) {
            $idempotencyKey = "class_{$classId}_{$type}_{$student->id}_" . date('YmdHi');
            $this->send($student, $type, $title, $message, $url, $data, $idempotencyKey);
        }
    }

    protected function isTypeDisabledByPreference(NotificationPreference $pref, string $type): bool
    {
        return match ($type) {
            'new_assignment' => ! $pref->new_assignment,
            'due_soon' => ! $pref->due_soon,
            'deadline_arrived' => ! $pref->deadline_arrived,
            'deadline_extended' => ! $pref->deadline_extended,
            'submission_received' => ! $pref->submission_received,
            'assignment_graded' => ! $pref->assignment_graded,
            'new_announcement' => ! $pref->new_announcement,
            'overdue_reminder' => ! $pref->overdue_reminder,
            default => false,
        };
    }
}

