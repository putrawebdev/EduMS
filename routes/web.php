<?php

use App\Http\Controllers\Admin\AdminSubjectController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\AssignmentSubmissionController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LearningMaterialController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ScheduleController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Redirect root to dashboard or login
Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

// Authenticated LMS Routes
Route::middleware(['auth', 'verified'])->group(function () {
    // 1. Unified Dynamic Dashboard (Siswa / Guru / Admin)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // 2. Classrooms (Kelas)
    Route::get('/kelas', [ClassroomController::class, 'index'])->name('classes.index');
    Route::post('/kelas', [ClassroomController::class, 'store'])->name('classes.store');
    Route::get('/kelas/{classroom}', [ClassroomController::class, 'show'])->name('classes.show');
    Route::put('/kelas/{classroom}', [ClassroomController::class, 'update'])->name('classes.update');
    Route::delete('/kelas/{classroom}', [ClassroomController::class, 'destroy'])->name('classes.destroy');
    Route::post('/kelas/{classroom}/anggota', [ClassroomController::class, 'addMember'])->name('classes.members.add');
    Route::delete('/kelas/{classroom}/anggota/{member}', [ClassroomController::class, 'removeMember'])->name('classes.members.remove');

    // 3. Learning Materials (Materi Pembelajaran)
    Route::get('/materi', [LearningMaterialController::class, 'index'])->name('materials.index');
    Route::post('/materi', [LearningMaterialController::class, 'store'])->name('materials.store');
    Route::get('/materi/{material}', [LearningMaterialController::class, 'show'])->name('materials.show');
    Route::put('/materi/{material}', [LearningMaterialController::class, 'update'])->name('materials.update');
    Route::delete('/materi/{material}', [LearningMaterialController::class, 'destroy'])->name('materials.destroy');
    Route::post('/materi/{material}/toggle-complete', [LearningMaterialController::class, 'toggleComplete'])->name('materials.toggle-complete');

    // 4. Assignments & Submissions (Tugas & Pengumpulan)
    Route::get('/tugas', [AssignmentController::class, 'index'])->name('assignments.index');
    Route::post('/tugas', [AssignmentController::class, 'store'])->name('assignments.store');
    Route::get('/tugas/{assignment}', [AssignmentController::class, 'show'])->name('assignments.show');
    Route::put('/tugas/{assignment}', [AssignmentController::class, 'update'])->name('assignments.update');
    Route::post('/tugas/{assignment}/perpanjang-tenggat', [AssignmentController::class, 'extendDeadline'])->name('assignments.extend-deadline');
    Route::delete('/tugas/{assignment}', [AssignmentController::class, 'destroy'])->name('assignments.destroy');
    Route::post('/tugas/{assignment}/kumpulkan', [AssignmentSubmissionController::class, 'store'])->name('submissions.store');
    Route::post('/pengumpulan/{submission}/nilai', [AssignmentSubmissionController::class, 'grade'])->name('submissions.grade');

    // 5. Schedules & Academic Calendar (Jadwal & Kalender)
    Route::get('/jadwal', [ScheduleController::class, 'index'])->name('schedules.index');
    Route::post('/jadwal', [ScheduleController::class, 'store'])->name('schedules.store');
    Route::delete('/jadwal/{schedule}', [ScheduleController::class, 'destroy'])->name('schedules.destroy');

    // 6. Announcements (Pengumuman)
    Route::get('/pengumuman', [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::post('/pengumuman', [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::delete('/pengumuman/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');

    // 7. In-App Notifications & Web Push Preferences
    Route::get('/notifikasi', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifikasi/{notification}/baca', [NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
    Route::post('/notifikasi/tandai-semua-dibaca', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::post('/notifikasi/preferensi', [NotificationController::class, 'updatePreferences'])->name('notifications.preferences.update');
    Route::post('/api/push-subscribe', [NotificationController::class, 'subscribe'])->name('api.push-subscribe');
    Route::post('/api/push-unsubscribe', [NotificationController::class, 'unsubscribe'])->name('api.push-unsubscribe');
    Route::post('/api/push-test', [NotificationController::class, 'testPush'])->name('api.push-test');

    // 8. Profile & Password
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.post-update');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // 9. Admin Specific Management
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/pengguna', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('/pengguna', [AdminUserController::class, 'store'])->name('users.store');
        Route::put('/pengguna/{user}', [AdminUserController::class, 'update'])->name('users.update');
        Route::post('/pengguna/{user}/toggle-active', [AdminUserController::class, 'toggleActive'])->name('users.toggle-active');
        Route::delete('/pengguna/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

        Route::get('/mata-pelajaran', [AdminSubjectController::class, 'index'])->name('subjects.index');
        Route::post('/mata-pelajaran', [AdminSubjectController::class, 'store'])->name('subjects.store');
        Route::put('/mata-pelajaran/{subject}', [AdminSubjectController::class, 'update'])->name('subjects.update');
        Route::delete('/mata-pelajaran/{subject}', [AdminSubjectController::class, 'destroy'])->name('subjects.destroy');
    });
});
//auth routes ppp
require __DIR__.'/auth.php';
