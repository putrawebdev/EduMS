<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Subject;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Schedule::with(['classroom', 'subject', 'teacher']);

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

        $schedules = $query->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        // Get upcoming assignment deadlines for calendar
        $upcomingDeadlines = Assignment::with(['classroom', 'subject'])
            ->where('is_published', true)
            ->where('due_date', '>=', Carbon::now('Asia/Jakarta')->subMonth())
            ->where('due_date', '<=', Carbon::now('Asia/Jakarta')->addMonths(2))
            ->get()
            ->map(function ($a) {
                return [
                    'id' => $a->id,
                    'title' => $a->title,
                    'subject' => $a->subject ? $a->subject->name : '-',
                    'subject_color' => $a->subject ? $a->subject->color : '#0D827C',
                    'due_date' => $a->due_date->toIso8601String(),
                    'due_date_formatted' => $a->due_date->format('Y-m-d'),
                    'class_name' => $a->classroom ? $a->classroom->name : '-',
                ];
            });

        $classes = $user->isSiswa() ? $user->enrolledClasses : Classroom::where('is_active', true)->get();
        $subjects = Subject::all();

        return Inertia::render('Schedule/Index', [
            'schedules' => $schedules,
            'upcomingDeadlines' => $upcomingDeadlines,
            'classes' => $classes,
            'subjects' => $subjects,
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
            'teacher_id' => ['nullable', 'exists:users,id'],
            'day_of_week' => ['required', 'integer', 'min:1', 'max:7'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'room' => ['nullable', 'string', 'max:50'],
        ]);

        if (empty($validated['teacher_id'])) {
            $validated['teacher_id'] = $user->id;
        }

        Schedule::create($validated);

        return redirect()->back()->with('success', 'Jadwal pelajaran berhasil ditambahkan.');
    }

    public function destroy(Request $request, Schedule $schedule): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! ($user->isGuru() && $schedule->teacher_id === $user->id)) {
            abort(403);
        }

        $schedule->delete();

        return redirect()->back()->with('success', 'Jadwal pelajaran berhasil dihapus.');
    }
}

