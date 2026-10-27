<?php

namespace App\Policies;

use App\Models\Assignment;
use App\Models\User;

class AssignmentPolicy
{
    public function view(User $user, Assignment $assignment): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isGuru()) {
            return $assignment->teacher_id === $user->id
                || $assignment->classroom->classSubjects()->where('teacher_id', $user->id)->exists();
        }

        return $assignment->classroom->students()->where('users.id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isGuru();
    }

    public function update(User $user, Assignment $assignment): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isGuru() && $assignment->teacher_id === $user->id;
    }

    public function delete(User $user, Assignment $assignment): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isGuru() && $assignment->teacher_id === $user->id;
    }

    public function grade(User $user, Assignment $assignment): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isGuru() && $assignment->teacher_id === $user->id;
    }
}

