<?php

namespace App\Policies;

use App\Models\LearningMaterial;
use App\Models\User;

class LearningMaterialPolicy
{
    public function view(User $user, LearningMaterial $material): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isGuru()) {
            return $material->teacher_id === $user->id
                || $material->classroom->classSubjects()->where('teacher_id', $user->id)->exists();
        }

        return $material->classroom->students()->where('users.id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isGuru();
    }

    public function update(User $user, LearningMaterial $material): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isGuru() && $material->teacher_id === $user->id;
    }

    public function delete(User $user, LearningMaterial $material): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isGuru() && $material->teacher_id === $user->id;
    }
}

