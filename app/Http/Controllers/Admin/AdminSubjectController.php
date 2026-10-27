<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubjectController extends Controller
{
    public function index(Request $request): Response
    {
        $subjects = Subject::withCount(['classes', 'learningMaterials', 'assignments'])
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('Admin/Subjects', [
            'subjects' => $subjects,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', 'unique:subjects,code'],
            'color' => ['required', 'string', 'max:30'],
            'icon' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
        ]);

        Subject::create($validated);

        return redirect()->back()->with('success', 'Mata pelajaran berhasil ditambahkan.');
    }

    public function update(Request $request, Subject $subject): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', 'unique:subjects,code,' . $subject->id],
            'color' => ['required', 'string', 'max:30'],
            'icon' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
        ]);

        $subject->update($validated);

        return redirect()->back()->with('success', 'Mata pelajaran berhasil diperbarui.');
    }

    public function destroy(Subject $subject): RedirectResponse
    {
        $subject->delete();

        return redirect()->back()->with('success', 'Mata pelajaran berhasil dihapus.');
    }
}

