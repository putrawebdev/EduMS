<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\AppNotification;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\ClassMember;
use App\Models\Classroom;
use App\Models\ClassSubject;
use App\Models\LearningMaterial;
use App\Models\MaterialProgress;
use App\Models\NotificationPreference;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@eduspace.test'],
            [
                'name' => 'Administrator EduSpace',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'nip_nisn' => '197901012003121001',
                'phone' => '081122334455',
                'bio' => 'Administrator Utama EduSpace LMS.',
                'grade_level' => 'Staf Tata Usaha & IT',
                'is_active' => true,
            ]
        );

        $teacherMtk = User::firstOrCreate(
            ['email' => 'hendra@eduspace.test'],
            [
                'name' => 'Pak Hendra Wijaya, M.Pd.',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip_nisn' => '198203202008011005',
                'phone' => '081298765432',
                'bio' => 'Guru Matematika & Wali Kelas X IPA 1.',
                'grade_level' => 'Guru Pengampu',
                'is_active' => true,
            ]
        );

        $teacherIndo = User::firstOrCreate(
            ['email' => 'rina@eduspace.test'],
            [
                'name' => 'Bu Rina Kusumawati, S.Pd.',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip_nisn' => '198501152010012001',
                'phone' => '081377889900',
                'bio' => 'Guru Bahasa Indonesia dan PPKN.',
                'grade_level' => 'Guru Pengampu',
                'is_active' => true,
            ]
        );

        $teacherProg = User::firstOrCreate(
            ['email' => 'surya@eduspace.test'],
            [
                'name' => 'Pak Surya Pratama, S.Kom.',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip_nisn' => '199004122015021003',
                'phone' => '081512345678',
                'bio' => 'Guru Pemrograman Dasar dan Informatika.',
                'grade_level' => 'Guru Pengampu',
                'is_active' => true,
            ]
        );

        $teacherEng = User::firstOrCreate(
            ['email' => 'maya@eduspace.test'],
            [
                'name' => 'Bu Maya Anggraini, M.Hum.',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip_nisn' => '198811252012012004',
                'phone' => '081698765432',
                'bio' => 'Guru Bahasa Inggris.',
                'grade_level' => 'Guru Pengampu',
                'is_active' => true,
            ]
        );

        $teacherArt = User::firstOrCreate(
            ['email' => 'dedi@eduspace.test'],
            [
                'name' => 'Pak Dedi Irawan, S.Sn.',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nip_nisn' => '198708172011011002',
                'phone' => '081734567890',
                'bio' => 'Guru Seni Budaya & Kesenian.',
                'grade_level' => 'Guru Pengampu',
                'is_active' => true,
            ]
        );

        // Student (Alya Putri - matching mockup)
        $studentAlya = User::firstOrCreate(
            ['email' => 'alya@eduspace.test'],
            [
                'name' => 'Alya Putri',
                'password' => Hash::make('password'),
                'role' => 'siswa',
                'nip_nisn' => '0071234567',
                'phone' => '081234567890',
                'bio' => 'Siswa Kelas 10 SMA Harapan Bangsa.',
                'grade_level' => 'Kelas 10',
                'is_active' => true,
            ]
        );
    }
}
