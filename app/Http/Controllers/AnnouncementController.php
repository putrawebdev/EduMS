<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Classroom;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Announcement::with(['author', 'classroom'])
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc');

        if ($user->isSiswa()) {
            $enrolledClassIds = $user->enrolledClasses()->pluck('classes.id')->toArray();
            $query->where(function ($q) use ($enrolledClassIds) {
                $q->whereNull('class_id')
                  ->orWhereIn('class_id', $enrolledClassIds);
            });
        }

        $announcements = $query->paginate(10);
        $classes = $user->isAdmin() || $user->isGuru() ? Classroom::where('is_active', true)->get() : [];

        return Inertia::render('Announcement/Index', [
            'announcements' => $announcements,
            'classes' => $classes,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! $user->isGuru()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'class_id' => ['nullable', 'exists:classes,id'],
            'is_pinned' => ['boolean'],
        ]);

        $announcement = Announcement::create([
            'user_id' => $user->id,
            'class_id' => $validated['class_id'] ?? null,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'is_pinned' => $validated['is_pinned'] ?? false,
            'published_at' => now(),
        ]);

        // Send notifications
        if ($announcement->class_id) {
            $this->notificationService->sendToClass(
                $announcement->class_id,
                'new_announcement',
                "Pengumuman: {$announcement->title}",
                mb_substr($announcement->content, 0, 120) . '...',
                '/pengumuman'
            );
        }

        return redirect()->back()->with('success', 'Pengumuman berhasil dipublikasikan.');
    }

    public function destroy(Request $request, Announcement $announcement): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && $announcement->user_id !== $user->id) {
            abort(403);
        }

        $announcement->delete();

        return redirect()->back()->with('success', 'Pengumuman berhasil dihapus.');
    }
}

