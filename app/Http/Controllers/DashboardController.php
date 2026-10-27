<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\AppNotification;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\ClassMember;
use App\Models\Classroom;
use App\Models\LearningMaterial;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return $this->adminDashboard($request, $user);
        }

        if ($user->isGuru()) {
            return $this->teacherDashboard($request, $user);
        }

        return $this->studentDashboard($request, $user);
    }

    protected function studentDashboard(Request $request, User $user): Response
    {
        $now = Carbon::now('Asia/Jakarta');

        // 1. Classes student is enrolled in
        $enrolledClasses = $user->enrolledClasses()
            ->where('classes.is_active', true)
            ->with(['teacher'])
            ->get();

        $enrolledClassIds = $enrolledClasses->pluck('id')->toArray();

        // Total classes in school vs enrolled
        $totalSchoolClasses = Classroom::where('is_active', true)->count();
        $enrolledClassesCount = $enrolledClasses->count();

        // 2. Assignments for these classes
        $allAssignments = Assignment::with(['subject', 'classroom'])
            ->whereIn('class_id', $enrolledClassIds)
            ->where('is_published', true)
            ->orderBy('due_date', 'asc')
            ->get();

        $studentSubmissions = AssignmentSubmission::where('user_id', $user->id)
            ->get()
            ->keyBy('assignment_id');

        $totalAssignmentsCount = $allAssignments->count();

        $completedAssignmentsCount = 0;
        $uncompletedAssignmentsCount = 0;
        $dueTodayCount = 0;
        $overdueCount = 0;

        $recentAssignments = [];

        foreach ($allAssignments as $assignment) {
            $sub = $studentSubmissions->get($assignment->id);
            $hasSubmitted = $sub && in_array($sub->status, ['submitted', 'graded', 'resubmitted']);
            $isDueToday = $assignment->due_date->isToday();
            $isOverdue = ! $hasSubmitted && $now->greaterThan($assignment->due_date);

            if ($hasSubmitted) {
                $completedAssignmentsCount++;
                $status = 'Sudah Dikumpulkan';
                $statusType = 'success';
            } elseif ($sub && $sub->status === 'draft') {
                $uncompletedAssignmentsCount++;
                $status = 'Sedang Dikerjakan';
                $statusType = 'warning';
            } else {
                $uncompletedAssignmentsCount++;
                if ($isOverdue) {
                    $status = 'Terlambat';
                    $statusType = 'danger';
                } else {
                    $status = 'Belum Dikerjakan';
                    $statusType = 'danger';
                }
            }

            if ($isDueToday && ! $hasSubmitted) {
                $dueTodayCount++;
            }

            if ($isOverdue) {
                $overdueCount++;
            }

            $recentAssignments[] = [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'subject_name' => $assignment->subject ? $assignment->subject->name : 'Umum',
                'subject_code' => $assignment->subject ? $assignment->subject->code : '-',
                'subject_color' => $assignment->subject ? $assignment->subject->color : '#0D827C',
                'subject_icon' => $assignment->subject ? $assignment->subject->icon : 'BookOpen',
                'class_name' => $assignment->classroom ? $assignment->classroom->name : '-',
                'due_date_formatted' => $assignment->due_date->locale('id')->isoFormat('D MMM Y, HH:mm'),
                'due_date_raw' => $assignment->due_date->toIso8601String(),
                'status' => $status,
                'status_type' => $statusType,
                'has_submitted' => $hasSubmitted,
                'score' => $sub ? $sub->score : null,
            ];
        }

        // 3. Subject cards for "Kelas Saya"
        // Get subjects from student's enrolled classes
        $subjects = Subject::whereHas('classes', function ($q) use ($enrolledClassIds) {
            $q->whereIn('classes.id', $enrolledClassIds);
        })->get();

        $subjectCards = [];
        $subjectProgressBreakdown = [];

        foreach ($subjects as $subject) {
            $subjectMaterialsCount = LearningMaterial::whereIn('class_id', $enrolledClassIds)
                ->where('subject_id', $subject->id)
                ->where('is_published', true)
                ->count();

            $subjectAssignments = $allAssignments->where('subject_id', $subject->id);
            $subjectAssignmentsCount = $subjectAssignments->count();

            $subjectCompletedCount = 0;
            foreach ($subjectAssignments as $sa) {
                if ($studentSubmissions->has($sa->id)) {
                    $subjectCompletedCount++;
                }
            }

            $progressPercentage = $subjectAssignmentsCount > 0
                ? round(($subjectCompletedCount / $subjectAssignmentsCount) * 100)
                : 100;

            $primaryClass = $enrolledClasses->first();

            $subjectCards[] = [
                'id' => $subject->id,
                'name' => $subject->name,
                'code' => $subject->code,
                'color' => $subject->color,
                'icon' => $subject->icon,
                'class_name' => $primaryClass ? $primaryClass->name : 'Kelas',
                'materials_count' => $subjectMaterialsCount,
                'assignments_count' => $subjectAssignmentsCount,
                'progress_percentage' => $progressPercentage,
            ];

            $subjectProgressBreakdown[] = [
                'subject_name' => $subject->name,
                'color' => $subject->color,
                'icon' => $subject->icon,
                'progress_percentage' => $progressPercentage,
            ];
        }

        // Overall progress percentage
        $overallProgressPercentage = $totalAssignmentsCount > 0
            ? round(($completedAssignmentsCount / $totalAssignmentsCount) * 100)
            : 0;

        // 4. Notifications
        $notifications = AppNotification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($n) {
                return [
                    'id' => $n->id,
                    'type' => $n->type,
                    'title' => $n->title,
                    'message' => $n->message,
                    'url' => $n->url,
                    'is_read' => $n->is_read,
                    'time_ago' => $n->created_at->locale('id')->diffForHumans(),
                ];
            });

        // 5. Schedules & Calendar deadlines
        $schedules = Schedule::with(['subject', 'classroom', 'teacher'])
            ->whereIn('class_id', $enrolledClassIds)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'day_of_week' => $s->day_of_week,
                    'day_name' => $s->day_name,
                    'start_time' => substr($s->start_time, 0, 5),
                    'end_time' => substr($s->end_time, 0, 5),
                    'subject_name' => $s->subject->name,
                    'subject_color' => $s->subject->color,
                    'room' => $s->room,
                    'teacher_name' => $s->teacher->name,
                ];
            });

        $announcements = Announcement::with('author')
            ->where(function ($q) use ($enrolledClassIds) {
                $q->whereNull('class_id')
                    ->orWhereIn('class_id', $enrolledClassIds);
            })
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        return Inertia::render('Dashboard', [
            'role' => 'siswa',
            'stats' => [
                'enrolled_classes' => $enrolledClassesCount,
                'total_school_classes' => $totalSchoolClasses,
                'uncompleted_assignments' => $uncompletedAssignmentsCount,
                'total_assignments' => $totalAssignmentsCount,
                'completed_assignments' => $completedAssignmentsCount,
                'due_today_assignments' => $dueTodayCount,
                'overdue_assignments' => $overdueCount,
                'overall_progress_percentage' => $overallProgressPercentage,
            ],
            'classes' => $subjectCards,
            'recent_assignments' => array_slice($recentAssignments, 0, 5),
            'progress_breakdown' => $subjectProgressBreakdown,
            'notifications' => $notifications,
            'schedules' => $schedules,
            'announcements' => $announcements,
        ]);
    }

    protected function teacherDashboard(Request $request, User $user): Response
    {
        $subjects = $user->subjects()->orderBy('name')->get();
        $subjectIds = $subjects->modelKeys();

        $classesTaught = Classroom::where(function ($query) use ($user, $subjectIds) {
            $query->where('teacher_id', $user->id)
                ->orWhereHas('classSubjects', function ($q) use ($user, $subjectIds) {
                    $q->where('teacher_id', $user->id)
                        ->whereIn('subject_id', $subjectIds);
                });
        })
            ->with(['students', 'subjects'])
            ->get();

        $classIds = $classesTaught->pluck('id')->toArray();

        $assignments = Assignment::where('teacher_id', $user->id)
            ->whereIn('subject_id', $subjectIds)
            ->with(['classroom', 'subject'])
            ->withCount(['submissions as total_submissions'])
            ->latest()
            ->get();

        $pendingGradingCount = AssignmentSubmission::whereHas('assignment', function ($q) use ($user, $subjectIds) {
            $q->where('teacher_id', $user->id)
                ->whereIn('subject_id', $subjectIds);
        })
        ->whereIn('status', ['submitted', 'resubmitted'])
        ->count();

        $totalStudents = ClassMember::whereIn('class_id', $classIds)->distinct('user_id')->count();

        $recentSubmissions = AssignmentSubmission::whereHas('assignment', function ($q) use ($user, $subjectIds) {
            $q->where('teacher_id', $user->id)
                ->whereIn('subject_id', $subjectIds);
        })
        ->with(['student', 'assignment.subject'])
        ->latest('submitted_at')
        ->limit(6)
        ->get();

        return Inertia::render('Teacher/Dashboard', [
            'role' => 'guru',
            'subjects' => $subjects,
            'stats' => [
                'classes_count' => $classesTaught->count(),
                'total_students' => $totalStudents,
                'assignments_count' => $assignments->count(),
                'pending_grading_count' => $pendingGradingCount,
            ],
            'classes' => $classesTaught,
            'recent_assignments' => $assignments->take(5),
            'recent_submissions' => $recentSubmissions,
        ]);
    }

    protected function adminDashboard(Request $request, User $user): Response
    {
        $stats = [
            'total_students' => User::where('role', 'siswa')->count(),
            'total_teachers' => User::where('role', 'guru')->count(),
            'total_classes' => Classroom::count(),
            'total_subjects' => Subject::count(),
            'total_assignments' => Assignment::count(),
            'total_materials' => LearningMaterial::count(),
        ];

        $recentUsers = User::latest()->limit(5)->get();
        $classes = Classroom::with(['teacher', 'students'])->latest()->limit(5)->get();
        $announcements = Announcement::with('author')->latest()->limit(5)->get();

        return Inertia::render('Admin/Dashboard', [
            'role' => 'admin',
            'stats' => $stats,
            'recent_users' => $recentUsers,
            'classes' => $classes,
            'announcements' => $announcements,
        ]);
    }
}
