<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'nip_nisn',
        'phone',
        'avatar',
        'bio',
        'grade_level',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isTeacher(): bool
    {
        return $this->role === 'guru';
    }

    public function isGuru(): bool
    {
        return $this->role === 'guru';
    }

    public function isStudent(): bool
    {
        return $this->role === 'siswa';
    }

    public function isSiswa(): bool
    {
        return $this->role === 'siswa';
    }

    // Classes student belongs to
    public function enrolledClasses(): BelongsToMany
    {
        return $this->belongsToMany(Classroom::class, 'class_members', 'user_id', 'class_id')
            ->withPivot('status', 'joined_at')
            ->withTimestamps();
    }

    // Classes where this user is the homeroom / primary teacher
    public function teachingClasses(): HasMany
    {
        return $this->hasMany(Classroom::class, 'teacher_id');
    }

    // Class subjects taught by this teacher
    public function classSubjects(): HasMany
    {
        return $this->hasMany(ClassSubject::class, 'teacher_id');
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'teacher_subjects', 'teacher_id', 'subject_id')
            ->withTimestamps();
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(AssignmentSubmission::class, 'user_id');
    }

    public function materialProgress(): HasMany
    {
        return $this->hasMany(MaterialProgress::class, 'user_id');
    }

    public function appNotifications(): HasMany
    {
        return $this->hasMany(AppNotification::class, 'user_id')->latest();
    }

    public function unreadNotificationsCount(): int
    {
        return $this->appNotifications()->where('is_read', false)->count();
    }

    public function notificationPreference(): HasOne
    {
        return $this->hasOne(NotificationPreference::class, 'user_id');
    }

    public function pushSubscriptions(): HasMany
    {
        return $this->hasMany(PushSubscription::class, 'user_id');
    }
}
