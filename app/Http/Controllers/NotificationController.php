<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use App\Models\NotificationPreference;
use App\Models\PushSubscription;
use App\Services\NotificationService;
use App\Services\WebPushService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService,
        protected WebPushService $webPushService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $notifications = AppNotification::where('user_id', $user->id)
            ->latest()
            ->paginate(15);

        $preferences = $user->notificationPreference ?: NotificationPreference::firstOrCreate(['user_id' => $user->id]);
        $hasPushSubscription = $user->pushSubscriptions()->exists();

        return Inertia::render('Notification/Index', [
            'notifications' => $notifications,
            'preferences' => $preferences,
            'hasPushSubscription' => $hasPushSubscription,
        ]);
    }

    public function markAsRead(Request $request, AppNotification $notification): RedirectResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return redirect()->back();
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        AppNotification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return redirect()->back()->with('success', 'Semua notifikasi ditandai sudah dibaca.');
    }

    public function updatePreferences(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'new_assignment' => ['boolean'],
            'due_soon' => ['boolean'],
            'deadline_arrived' => ['boolean'],
            'deadline_extended' => ['boolean'],
            'submission_received' => ['boolean'],
            'assignment_graded' => ['boolean'],
            'new_announcement' => ['boolean'],
            'overdue_reminder' => ['boolean'],
            'web_push' => ['boolean'],
        ]);

        $pref = $user->notificationPreference ?: new NotificationPreference(['user_id' => $user->id]);
        $pref->fill($validated);
        $pref->save();

        return redirect()->back()->with('success', 'Preferensi notifikasi berhasil diperbarui.');
    }

    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'string'],
            'publicKey' => ['required', 'string'],
            'authToken' => ['required', 'string'],
            'contentEncoding' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $endpointHash = hash('sha256', $validated['endpoint']);

        PushSubscription::updateOrCreate(
            [
                'user_id' => $user->id,
                'endpoint_hash' => $endpointHash,
            ],
            [
                'endpoint' => $validated['endpoint'],
                'public_key' => $validated['publicKey'],
                'auth_token' => $validated['authToken'],
                'content_encoding' => $validated['contentEncoding'] ?? 'aesgcm',
                'user_agent' => $request->userAgent(),
            ]
        );

        return response()->json(['success' => true, 'message' => 'Langganan Web Push berhasil disimpan.']);
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'string'],
        ]);

        $endpointHash = hash('sha256', $validated['endpoint']);

        PushSubscription::where('user_id', $request->user()->id)
            ->where('endpoint_hash', $endpointHash)
            ->delete();

        return response()->json(['success' => true, 'message' => 'Langganan Web Push dihapus.']);
    }

    public function testPush(Request $request): JsonResponse
    {
        $user = $request->user();

        $result = $this->webPushService->sendToUser(
            $user,
            'Uji Coba Push Notification EduSpace',
            'Ini adalah notifikasi uji coba dari EduSpace LMS. Integrasi Web Push VAPID Anda berfungsi dengan baik!',
            '/notifikasi',
            'test_notification',
            'test_' . $user->id . '_' . time()
        );

        return response()->json([
            'success' => true,
            'message' => 'Uji coba pengiriman notifikasi selesai diproses.',
            'result' => $result,
        ]);
    }
}

