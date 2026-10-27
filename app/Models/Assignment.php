<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'class_id',
        'subject_id',
        'teacher_id',
        'title',
        'instructions',
        'attachment_path',
        'attachment_name',
        'start_date',
        'due_date',
        'max_score',
        'allow_late_submission',
        'late_penalty_percent',
        'is_published',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'due_date' => 'datetime',
        'max_score' => 'integer',
        'allow_late_submission' => 'boolean',
        'late_penalty_percent' => 'integer',
        'is_published' => 'boolean',
    ];

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class, 'class_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(AssignmentSubmission::class, 'assignment_id');
    }

    public function submissionFor(int $userId): ?AssignmentSubmission
    {
        return $this->submissions()->where('user_id', $userId)->latest()->first();
    }

    public function isPastDue(): bool
    {
        return Carbon::now('Asia/Jakarta')->greaterThan($this->due_date);
    }

    public function isDueToday(): bool
    {
        return $this->due_date->isToday();
    }
}

