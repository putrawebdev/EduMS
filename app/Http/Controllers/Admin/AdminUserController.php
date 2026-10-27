<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::query();

        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        if ($request->has('search') && $request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('nip_nisn', 'like', "%{$s}%");
            });
        }

        $users = $query->with('subjects:id,name')->orderBy('name')->paginate(15)->withQueryString();

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'subjects' => Subject::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['role', 'search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['admin', 'guru', 'siswa'])],
            'subject_ids' => ['nullable', 'array', 'max:2'],
            'subject_ids.*' => ['integer', 'distinct', 'exists:subjects,id'],
            'nip_nisn' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:30'],
            'grade_level' => ['nullable', 'string', 'max:50'],
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['is_active'] = true;

        $subjectIds = $validated['role'] === 'guru' ? ($validated['subject_ids'] ?? []) : [];
        unset($validated['subject_ids']);

        $user = User::create($validated);
        $user->subjects()->sync($subjectIds);

        return redirect()->back()->with('success', 'Pengguna baru berhasil ditambahkan.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'role' => ['required', Rule::in(['admin', 'guru', 'siswa'])],
            'subject_ids' => ['nullable', 'array', 'max:2'],
            'subject_ids.*' => ['integer', 'distinct', 'exists:subjects,id'],
            'nip_nisn' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:30'],
            'grade_level' => ['nullable', 'string', 'max:50'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $subjectIds = $validated['role'] === 'guru' ? ($validated['subject_ids'] ?? []) : [];
        unset($validated['subject_ids']);

        $user->update($validated);
        $user->subjects()->sync($subjectIds);

        return redirect()->back()->with('success', 'Data pengguna berhasil diperbarui.');
    }

    public function toggleActive(User $user): RedirectResponse
    {
        $user->update(['is_active' => ! $user->is_active]);

        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->back()->with('success', "Pengguna {$user->name} berhasil {$status}.");
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'Pengguna berhasil dihapus.');
    }
}
