<?php

namespace App\Http\Controllers;

use App\Models\ClassMember;
use App\Models\Classroom;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassroomController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Classroom::with(['teacher', 'subjects'])
            ->withCount(['students', 'learningMaterials', 'assignments']);

        if ($user->isSiswa()) {
            $query->whereHas('students', function ($q) use ($user) {
                $q->where('users.id', $user->id);
            });
        } elseif ($user->isGuru()) {
            $query->where(function ($q) use ($user) {
                $q->where('teacher_id', $user->id)
                  ->orWhereHas('classSubjects', function ($sq) use ($user) {
                      $sq->where('teacher_id', $user->id);
                  });
            });
        }

        $search = $request->input('search');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $classes = $query->paginate(12)->withQueryString();
        $teachers = $user->isAdmin() ? User::where('role', 'guru')->get() : [];

        return Inertia::render('Classroom/Index', [
            'classes' => $classes,
            'filters' => [
                'search' => $search,
            ],
            'teachers' => $teachers,
        ]);
    }

    public function show(Request $request, Classroom $classroom): Response
    {
        $user = $request->user();

        // Check policy
        if ($user->isSiswa() && ! $classroom->students()->where('users.id', $user->id)->exists()) {
            abort(403, 'Anda bukan anggota kelas ini.');
        }

        $classroom->load([
            'teacher',
            'subjects',
            'students',
            'schedules.subject',
            'schedules.teacher',
            'learningMaterials.subject',
            'learningMaterials.teacher',
            'assignments.subject',
            'assignments.teacher',
            'announcements.author',
        ]);

        $allStudents = $user->isAdmin() || $user->isGuru()
            ? User::where('role', 'siswa')->where('is_active', true)->get()
            : [];

        $allSubjects = Subject::all();

        return Inertia::render('Classroom/Show', [
            'classroom' => $classroom,
            'availableStudents' => $allStudents,
            'availableSubjects' => $allSubjects,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! $user->isGuru()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:classes,code'],
            'description' => ['nullable', 'string'],
            'teacher_id' => ['nullable', 'exists:users,id'],
            'academic_year' => ['required', 'string', 'max:20'],
            'semester' => ['required', 'string', 'max:20'],
        ]);

        if ($user->isGuru() && empty($validated['teacher_id'])) {
            $validated['teacher_id'] = $user->id;
        }

        $classroom = Classroom::create($validated);

        return redirect()->route('classes.show', $classroom->id)
            ->with('success', "Kelas {$classroom->name} berhasil dibuat.");
    }

    public function update(Request $request, Classroom $classroom): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! ($user->isGuru() && $classroom->teacher_id === $user->id)) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:classes,code,' . $classroom->id],
            'description' => ['nullable', 'string'],
            'teacher_id' => ['nullable', 'exists:users,id'],
            'academic_year' => ['required', 'string', 'max:20'],
            'semester' => ['required', 'string', 'max:20'],
            'is_active' => ['boolean'],
        ]);

        $classroom->update($validated);

        return redirect()->back()->with('success', 'Informasi kelas berhasil diperbarui.');
    }

    public function destroy(Request $request, Classroom $classroom): RedirectResponse
    {
        if (! $request->user()->isAdmin()) {
            abort(403);
        }

        $classroom->delete();

        return redirect()->route('classes.index')->with('success', 'Kelas berhasil dihapus.');
    }

    public function addMember(Request $request, Classroom $classroom): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! ($user->isGuru() && $classroom->teacher_id === $user->id)) {
            abort(403);
        }

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        $targetUser = User::findOrFail($validated['user_id']);
        if (! $targetUser->isSiswa()) {
            return redirect()->back()->with('error', 'Hanya siswa yang dapat ditambahkan sebagai anggota kelas.');
        }

        ClassMember::firstOrCreate(
            ['class_id' => $classroom->id, 'user_id' => $targetUser->id],
            ['status' => 'active', 'joined_at' => now()]
        );

        return redirect()->back()->with('success', "Siswa {$targetUser->name} berhasil ditambahkan ke kelas.");
    }

    public function removeMember(Request $request, Classroom $classroom, User $member): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! ($user->isGuru() && $classroom->teacher_id === $user->id)) {
            abort(403);
        }

        ClassMember::where('class_id', $classroom->id)
            ->where('user_id', $member->id)
            ->delete();

        return redirect()->back()->with('success', "Siswa {$member->name} dikeluarkan dari kelas.");
    }
}

