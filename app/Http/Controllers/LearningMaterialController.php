<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\LearningMaterial;
use App\Models\MaterialProgress;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LearningMaterialController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = LearningMaterial::with(['classroom', 'subject', 'teacher'])
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

        if ($request->has('class_id') && $request->class_id) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->has('search') && $request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%");
            });
        }

        $materials = $query->latest()->paginate(12)->withQueryString();

        // Get progress for student
        $completedMaterialIds = [];
        if ($user->isSiswa()) {
            $completedMaterialIds = MaterialProgress::where('user_id', $user->id)
                ->where('is_completed', true)
                ->pluck('learning_material_id')
                ->toArray();
        }

        $subjects = Subject::all();
        $classes = $user->isSiswa() ? $user->enrolledClasses : Classroom::where('is_active', true)->get();

        return Inertia::render('Material/Index', [
            'materials' => $materials,
            'completedMaterialIds' => $completedMaterialIds,
            'subjects' => $subjects,
            'classes' => $classes,
            'filters' => $request->only(['subject_id', 'class_id', 'search']),
        ]);
    }

    public function show(Request $request, LearningMaterial $material): Response
    {
        $user = $request->user();

        // Authorization check
        if ($user->isSiswa() && ! $material->classroom->students()->where('users.id', $user->id)->exists()) {
            abort(403, 'Anda tidak terdaftar di kelas materi ini.');
        }

        $material->load(['classroom', 'subject', 'teacher']);

        $isCompleted = false;
        if ($user->isSiswa()) {
            $isCompleted = MaterialProgress::where('learning_material_id', $material->id)
                ->where('user_id', $user->id)
                ->where('is_completed', true)
                ->exists();
        }

        return Inertia::render('Material/Show', [
            'material' => $material,
            'isCompleted' => $isCompleted,
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
            'description' => ['nullable', 'string'],
            'external_url' => ['nullable', 'url'],
            'file' => ['nullable', 'file', 'max:51200'], // max 50MB
        ]);

        $filePath = null;
        $fileName = null;
        $fileSize = null;
        $fileType = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $fileSize = $file->getSize();
            $fileType = $file->getClientOriginalExtension();
            $filePath = $file->store('materials', 'public');
        }

        $material = LearningMaterial::create([
            'class_id' => $validated['class_id'],
            'subject_id' => $validated['subject_id'],
            'teacher_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_size' => $fileSize,
            'file_type' => $fileType,
            'external_url' => $validated['external_url'] ?? null,
            'is_published' => true,
            'published_at' => now(),
        ]);

        return redirect()->route('materials.show', $material->id)
            ->with('success', 'Materi pembelajaran berhasil ditambahkan.');
    }

    public function update(Request $request, LearningMaterial $material): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! ($user->isGuru() && $material->teacher_id === $user->id)) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'external_url' => ['nullable', 'url'],
            'file' => ['nullable', 'file', 'max:51200'],
        ]);

        if ($request->hasFile('file')) {
            if ($material->file_path && Storage::disk('public')->exists($material->file_path)) {
                Storage::disk('public')->delete($material->file_path);
            }

            $file = $request->file('file');
            $validated['file_name'] = $file->getClientOriginalName();
            $validated['file_size'] = $file->getSize();
            $validated['file_type'] = $file->getClientOriginalExtension();
            $validated['file_path'] = $file->store('materials', 'public');
        }

        $material->update($validated);

        return redirect()->back()->with('success', 'Materi berhasil diperbarui.');
    }

    public function destroy(Request $request, LearningMaterial $material): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! ($user->isGuru() && $material->teacher_id === $user->id)) {
            abort(403);
        }

        if ($material->file_path && Storage::disk('public')->exists($material->file_path)) {
            Storage::disk('public')->delete($material->file_path);
        }

        $material->delete();

        return redirect()->route('materials.index')->with('success', 'Materi berhasil dihapus.');
    }

    public function toggleComplete(Request $request, LearningMaterial $material): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isSiswa()) {
            abort(403);
        }

        $progress = MaterialProgress::where('learning_material_id', $material->id)
            ->where('user_id', $user->id)
            ->first();

        if ($progress) {
            $progress->delete();
            $status = false;
        } else {
            MaterialProgress::create([
                'learning_material_id' => $material->id,
                'user_id' => $user->id,
                'is_completed' => true,
                'completed_at' => now(),
            ]);
            $status = true;
        }

        return redirect()->back()->with('success', $status ? 'Materi ditandai selesai dipelajari.' : 'Tanda selesai dibatalkan.');
    }
}

