<?php

namespace App\Policies;

use App\Models\Classroom;
use App\Models\User;

class ClassroomPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Classroom $classroom): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isGuru()) {
            return $classroom->teacher_id === $user->id
                || $classroom->classSubjects()->where('teacher_id', $user->id)->exists();
        }

        // Student must be enrolled
        return $classroom->students()->where('users.id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isGuru();
    }

    public function update(User $user, Classroom $classroom): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isGuru() && $classroom->teacher_id === $user->id;
    }

    public function delete(User $user, Classroom $classroom): bool
    {
        return $user->isAdmin();
    }

    public function manageMembers(User $user, Classroom $classroom): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isGuru() && $classroom->teacher_id === $user->id;
    }
}

