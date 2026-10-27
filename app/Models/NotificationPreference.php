<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'new_assignment',
        'due_soon',
        'deadline_arrived',
        'deadline_extended',
        'submission_received',
        'assignment_graded',
        'new_announcement',
        'overdue_reminder',
        'web_push',
    ];

    protected $casts = [
        'new_assignment' => 'boolean',
        'due_soon' => 'boolean',
        'deadline_arrived' => 'boolean',
        'deadline_extended' => 'boolean',
        'submission_received' => 'boolean',
        'assignment_graded' => 'boolean',
        'new_announcement' => 'boolean',
        'overdue_reminder' => 'boolean',
        'web_push' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

