<?php

namespace App\Policies;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\User;

class AssignmentSubmissionPolicy
{
    public function view(User $user, AssignmentSubmission $submission): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        // Student can only see their own submission
        if ($user->isSiswa()) {
            return $submission->user_id === $user->id;
        }

        // Teacher can see submissions for their assignment
        if ($user->isGuru()) {
            return $submission->assignment->teacher_id === $user->id
                || $submission->assignment->classroom->teacher_id === $user->id;
        }

        return false;
    }

    public function submit(User $user, Assignment $assignment): bool
    {
        if (! $user->isSiswa()) {
            return false;
        }

        return $assignment->classroom->students()->where('users.id', $user->id)->exists();
    }

    public function grade(User $user, AssignmentSubmission $submission): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isGuru()) {
            return $submission->assignment->teacher_id === $user->id;
        }

        return false;
    }
}

