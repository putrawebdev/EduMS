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

        // Additional student
        $studentBudi = User::firstOrCreate(
            ['email' => 'budi@eduspace.test'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('password'),
                'role' => 'siswa',
                'nip_nisn' => '0071234568',
                'phone' => '081234567891',
                'bio' => 'Siswa Kelas 10 SMA Harapan Bangsa.',
                'grade_level' => 'Kelas 10',
                'is_active' => true,
            ]
        );

        // Notification Preferences for users
        foreach ([$admin, $teacherMtk, $teacherIndo, $teacherProg, $teacherEng, $teacherArt, $studentAlya, $studentBudi] as $u) {
            NotificationPreference::firstOrCreate(
                ['user_id' => $u->id],
                [
                    'new_assignment' => true,
                    'due_soon' => true,
                    'deadline_arrived' => true,
                    'deadline_extended' => true,
                    'submission_received' => true,
                    'assignment_graded' => true,
                    'new_announcement' => true,
                    'overdue_reminder' => true,
                    'web_push' => true,
                ]
            );
        }

        // 2. Classrooms
        $class1 = Classroom::firstOrCreate(
            ['code' => 'X-IPA-1'],
            [
                'name' => 'X IPA 1',
                'description' => 'Kelas X Peminatan Matematika dan Ilmu Pengetahuan Alam 1.',
                'teacher_id' => $teacherMtk->id,
                'academic_year' => '2025/2026',
                'semester' => 'Ganjil',
                'is_active' => true,
            ]
        );

        $class2 = Classroom::firstOrCreate(
            ['code' => 'X-IPA-2'],
            [
                'name' => 'X IPA 2',
                'description' => 'Kelas X Peminatan Matematika dan Ilmu Pengetahuan Alam 2.',
                'teacher_id' => $teacherIndo->id,
                'academic_year' => '2025/2026',
                'semester' => 'Ganjil',
                'is_active' => true,
            ]
        );

        $class3 = Classroom::firstOrCreate(
            ['code' => 'XI-IPA-1'],
            [
                'name' => 'XI IPA 1',
                'description' => 'Kelas XI Peminatan MIPA 1.',
                'teacher_id' => $teacherProg->id,
                'academic_year' => '2025/2026',
                'semester' => 'Ganjil',
                'is_active' => true,
            ]
        );

        // Enroll students into X IPA 1
        ClassMember::firstOrCreate(
            ['class_id' => $class1->id, 'user_id' => $studentAlya->id],
            ['status' => 'active', 'joined_at' => Carbon::now()->subDays(14)]
        );
        ClassMember::firstOrCreate(
            ['class_id' => $class1->id, 'user_id' => $studentBudi->id],
            ['status' => 'active', 'joined_at' => Carbon::now()->subDays(14)]
        );

        // 3. Subjects
        $subMtk = Subject::firstOrCreate(
            ['code' => 'MTK'],
            [
                'name' => 'Matematika',
                'color' => '#2563EB',
                'icon' => 'Calculator',
                'description' => 'Pelajaran aljabar, fungsi, trigonometri, dan kalkulus dasar.',
            ]
        );

        $subIndo = Subject::firstOrCreate(
            ['code' => 'BIN'],
            [
                'name' => 'Bahasa Indonesia',
                'color' => '#EF4444',
                'icon' => 'BookOpen',
                'description' => 'Kajian tata bahasa, teks eksposisi, sastra, dan penulisan ilmiah.',
            ]
        );

        $subEng = Subject::firstOrCreate(
            ['code' => 'BIG'],
            [
                'name' => 'Bahasa Inggris',
                'color' => '#8B5CF6',
                'icon' => 'Languages',
                'description' => 'General English, reading comprehension, speaking and grammar.',
            ]
        );

        $subProg = Subject::firstOrCreate(
            ['code' => 'PRG'],
            [
                'name' => 'Pemrograman Dasar',
                'color' => '#0D827C',
                'icon' => 'Code',
                'description' => 'Logika pemrograman, algoritma komputer, HTML, CSS, dan dasar JavaScript.',
            ]
        );

        $subPpkn = Subject::firstOrCreate(
            ['code' => 'PKN'],
            [
                'name' => 'PPKN',
                'color' => '#F59E0B',
                'icon' => 'Scale',
                'description' => 'Pendidikan Pancasila dan Kewarganegaraan, etika berbangsa.',
            ]
        );

        $subArt = Subject::firstOrCreate(
            ['code' => 'SBD'],
            [
                'name' => 'Seni Budaya',
                'color' => '#10B981',
                'icon' => 'Palette',
                'description' => 'Seni rupa, estetika desain, karya seni visual dan musik tradisional.',
            ]
        );

        // 4. Assign Subjects to Class 1
        $classSubjectMappings = [
            ['subject' => $subMtk, 'teacher' => $teacherMtk],
            ['subject' => $subIndo, 'teacher' => $teacherIndo],
            ['subject' => $subEng, 'teacher' => $teacherEng],
            ['subject' => $subProg, 'teacher' => $teacherProg],
            ['subject' => $subPpkn, 'teacher' => $teacherIndo],
            ['subject' => $subArt, 'teacher' => $teacherArt],
        ];

        foreach ($classSubjectMappings as $map) {
            ClassSubject::firstOrCreate(
                [
                    'class_id' => $class1->id,
                    'subject_id' => $map['subject']->id,
                    'teacher_id' => $map['teacher']->id,
                ]
            );

            $map['teacher']->subjects()->syncWithoutDetaching([$map['subject']->id]);
        }

        // 5. Learning Materials
        $materials = [
            // Matematika (8 materi)
            ['sub' => $subMtk, 'teacher' => $teacherMtk, 'title' => 'Pengenalan Fungsi Trigonometri & Kuadran', 'desc' => 'Definisi sin, cos, tan dalam segitiga siku-siku dan kuadran I-IV.'],
            ['sub' => $subMtk, 'teacher' => $teacherMtk, 'title' => 'Identitas Dasar Trigonometri', 'desc' => 'Rumus identitas phytagoras dan pembuktiannya.'],
            ['sub' => $subMtk, 'teacher' => $teacherMtk, 'title' => 'Aturan Sinus dan Kosinus', 'desc' => 'Penerapan aturan sinus dan kosinus pada segitiga sembarang.'],
            ['sub' => $subMtk, 'teacher' => $teacherMtk, 'title' => 'Grafik Fungsi Sinus dan Kosinus', 'desc' => 'Menganalisis amplitudo, periode, dan fase gelombang.'],
            ['sub' => $subMtk, 'teacher' => $teacherMtk, 'title' => 'Persamaan Trigonometri Sederhana', 'desc' => 'Menemukan himpunan penyelesaian dalam rentang interval tertentu.'],
            ['sub' => $subMtk, 'teacher' => $teacherMtk, 'title' => 'Jumlah dan Selisih Dua Sudut', 'desc' => 'Penjabaran rumus sudut ganda dan perkalian sinus-kosinus.'],
            ['sub' => $subMtk, 'teacher' => $teacherMtk, 'title' => 'Aplikasi Trigonometri dalam Kehidupan Nyata', 'desc' => 'Pengukuran tinggi pohon, menara, dan jarak pelayaran.'],
            ['sub' => $subMtk, 'teacher' => $teacherMtk, 'title' => 'Modul Rangkuman dan Latihan Persiapan Penilaian Harian', 'desc' => 'Ringkasan komprehensif seluruh materi bab trigonometri.'],

            // Bahasa Indonesia (7 materi)
            ['sub' => $subIndo, 'teacher' => $teacherIndo, 'title' => 'Struktur dan Kaidah Teks Laporan Hasil Observasi', 'desc' => 'Definisi umum, deskripsi bagian, dan deskripsi manfaat.'],
            ['sub' => $subIndo, 'teacher' => $teacherIndo, 'title' => 'Menganalisis Kebahasaan Teks LHO', 'desc' => 'Verba, nomina, kalimat definisi, dan kalimat deskripsi.'],
            ['sub' => $subIndo, 'teacher' => $teacherIndo, 'title' => 'Menyusun Kerangka dan Menulis Teks Eksposisi', 'desc' => 'Tesis, argumen, dan penegasan ulang pendapat.'],
            ['sub' => $subIndo, 'teacher' => $teacherIndo, 'title' => 'Membedakan Fakta dan Opini dalam Teks Berita', 'desc' => 'Analisis objektifitas media dan cek fakta informasi.'],
            ['sub' => $subIndo, 'teacher' => $teacherIndo, 'title' => 'Teknik Menyusun Poster Edukasi yang Efektif', 'desc' => 'Prinsip tata letak, tipografi, dan pesan komunikatif.'],
            ['sub' => $subIndo, 'teacher' => $teacherIndo, 'title' => 'Kaidah Ejaan Bahasa Indonesia (EYD Edisi V)', 'desc' => 'Penggunaan huruf kapital, tanda baca, dan kata serapan.'],
            ['sub' => $subIndo, 'teacher' => $teacherIndo, 'title' => 'Apresiasi Puisi dan Makna Konotatif', 'desc' => 'Diksi, imaji, majas, rima, dan tipografi dalam puisi modern.'],

            // Bahasa Inggris (6 materi)
            ['sub' => $subEng, 'teacher' => $teacherEng, 'title' => 'Descriptive Text: Describing People and Places', 'desc' => 'Identification, description, and sensory adjective usages.'],
            ['sub' => $subEng, 'teacher' => $teacherEng, 'title' => 'Mastering Simple Present vs Present Continuous', 'desc' => 'Formula, time signals, and practice worksheets.'],
            ['sub' => $subEng, 'teacher' => $teacherEng, 'title' => 'Congratulating and Complimenting Others', 'desc' => 'Expressions of approval, celebration, and polite responses.'],
            ['sub' => $subEng, 'teacher' => $teacherEng, 'title' => 'Recount Texts: Sharing Past Experiences', 'desc' => 'Orientation, series of events, and re-orientation structure.'],
            ['sub' => $subEng, 'teacher' => $teacherEng, 'title' => 'Past Simple and Irregular Verbs Review', 'desc' => 'Common irregular verbs and pronunciation.'],
            ['sub' => $subEng, 'teacher' => $teacherEng, 'title' => 'Reading Comprehension: Folk Tales and Legends', 'desc' => 'Analyzing moral values, characters, and plot sequence.'],

            // Pemrograman Dasar (5 materi)
            ['sub' => $subProg, 'teacher' => $teacherProg, 'title' => 'Pengantar Logika Pemrograman & Algoritma', 'desc' => 'Pseudocode, diagram alir (flowchart), dan logika komputasi.'],
            ['sub' => $subProg, 'teacher' => $teacherProg, 'title' => 'Struktur Halaman Web dengan HTML5', 'desc' => 'Tag semantik, formulir, tabel, dan multimedia embed.'],
            ['sub' => $subProg, 'teacher' => $teacherProg, 'title' => 'Styling Halaman Web dengan CSS3 & Flexbox', 'desc' => 'Box model, flexbox layout, responsif grid, dan transisi visual.'],
            ['sub' => $subProg, 'teacher' => $teacherProg, 'title' => 'Dasar Interaktivitas dengan JavaScript', 'desc' => 'Variabel let/const, tipe data, fungsi, dan manipulasi DOM.'],
            ['sub' => $subProg, 'teacher' => $teacherProg, 'title' => 'Proyek Mini: Membangun Website Profil Portofolio', 'desc' => 'Panduan langkah demi langkah mempublikasikan website pribadi.'],

            // PPKN (3 materi)
            ['sub' => $subPpkn, 'teacher' => $teacherIndo, 'title' => 'Nilai-Nilai Pancasila dalam Praktik Penyelenggaraan Negara', 'desc' => 'Sila 1 sampai 5 dan perwujudannya dalam kebijakan publik.'],
            ['sub' => $subPpkn, 'teacher' => $teacherIndo, 'title' => 'Ketentuan UUD NRI 1945 dalam Kehidupan Berbangsa', 'desc' => 'Wilayah negara, warga negara, agama, dan pertahanan.'],
            ['sub' => $subPpkn, 'teacher' => $teacherIndo, 'title' => 'Harmoni Keberagaman dalam Bingkai Bhinneka Tunggal Ika', 'desc' => 'Toleransi, integrasi nasional, dan pencegahan konflik sosial.'],

            // Seni Budaya (2 materi)
            ['sub' => $subArt, 'teacher' => $teacherArt, 'title' => 'Konsep dan Teknik Seni Rupa Dua Dimensi', 'desc' => 'Garis, bidang, warna, tekstur, ruang, dan proporsi gambar.'],
            ['sub' => $subArt, 'teacher' => $teacherArt, 'title' => 'Ilustrasi dan Gambar Perspektif Satu dan Dua Titik Hilang', 'desc' => 'Teknik menggambar benda dan transportasi secara proporsional.'],
        ];

        $createdMaterials = [];
        foreach ($materials as $index => $mat) {
            $m = LearningMaterial::firstOrCreate(
                [
                    'class_id' => $class1->id,
                    'subject_id' => $mat['sub']->id,
                    'title' => $mat['title'],
                ],
                [
                    'teacher_id' => $mat['teacher']->id,
                    'description' => $mat['desc'],
                    'external_url' => 'https://kemdikbud.go.id',
                    'is_published' => true,
                    'published_at' => Carbon::now()->subDays(10 - ($index % 5)),
                ]
            );
            $createdMaterials[] = $m;

            // Mark some materials as completed by Alya to show progress
            if ($index % 2 === 0 || $index < 8) {
                MaterialProgress::firstOrCreate(
                    [
                        'learning_material_id' => $m->id,
                        'user_id' => $studentAlya->id,
                    ],
                    [
                        'is_completed' => true,
                        'completed_at' => Carbon::now()->subDays(2),
                    ]
                );
            }
        }

        // 6. Assignments (Tugas)
        // 1. Latihan Soal Trigonometri (Matematika) - Belum Dikerjakan, deadline soon
        $assignTrigo = Assignment::firstOrCreate(
            [
                'class_id' => $class1->id,
                'subject_id' => $subMtk->id,
                'title' => 'Latihan Soal Trigonometri',
            ],
            [
                'teacher_id' => $teacherMtk->id,
                'instructions' => 'Kerjakan 10 soal latihan trigonometri pada halaman 45 buku paket. Tuliskan langkah pengerjaan dengan rapi pada kertas folio bergaris, scan atau foto lalu unggah dalam format PDF.',
                'start_date' => Carbon::now()->subDays(2),
                'due_date' => Carbon::today('Asia/Jakarta')->setTime(23, 59),
                'max_score' => 100,
                'allow_late_submission' => true,
                'late_penalty_percent' => 10,
                'is_published' => true,
            ]
        );

        // 2. Esai Pancasila (PPKN) - Sedang Dikerjakan / due today
        $assignPancasila = Assignment::firstOrCreate(
            [
                'class_id' => $class1->id,
                'subject_id' => $subPpkn->id,
                'title' => 'Esai Pancasila',
            ],
            [
                'teacher_id' => $teacherIndo->id,
                'instructions' => 'Tulis esai argumentatif sepanjang minimal 500 kata mengenai implementasi sila ke-5 Pancasila dalam era digitalisasi saat ini.',
                'start_date' => Carbon::now()->subDays(3),
                'due_date' => Carbon::today('Asia/Jakarta')->setTime(23, 59),
                'max_score' => 100,
                'allow_late_submission' => true,
                'late_penalty_percent' => 15,
                'is_published' => true,
            ]
        );

        // 3. Tugas Kelompok Poster (Bahasa Indonesia) - Belum Dikerjakan, deadline tomorrow
        $assignPoster = Assignment::firstOrCreate(
            [
                'class_id' => $class1->id,
                'subject_id' => $subIndo->id,
                'title' => 'Tugas Kelompok Poster',
            ],
            [
                'teacher_id' => $teacherIndo->id,
                'instructions' => 'Buat poster ajakan literasi membaca buku untuk mading sekolah. Format PNG/JPG resolusi tinggi atau PDF A3.',
                'start_date' => Carbon::now()->subDays(1),
                'due_date' => Carbon::tomorrow('Asia/Jakarta')->setTime(12, 00),
                'max_score' => 100,
                'allow_late_submission' => false,
                'late_penalty_percent' => 0,
                'is_published' => true,
            ]
        );

        // 4. Tugas Coding Website (Pemrograman Dasar) - Sudah Dikumpulkan & Graded 90
        $assignCoding = Assignment::firstOrCreate(
            [
                'class_id' => $class1->id,
                'subject_id' => $subProg->id,
                'title' => 'Tugas Coding Website',
            ],
            [
                'teacher_id' => $teacherProg->id,
                'instructions' => 'Buat halaman website biodata sederhana menggunakan HTML5 dan CSS dasar. Unggah file zip yang berisi index.html dan style.css.',
                'start_date' => Carbon::now()->subDays(5),
                'due_date' => Carbon::now()->addDays(2)->setTime(23, 59),
                'max_score' => 100,
                'allow_late_submission' => true,
                'late_penalty_percent' => 0,
                'is_published' => true,
            ]
        );

        // 5. Menggambar Alat Transportasi (Seni Budaya) - Belum Dikerjakan
        $assignDrawing = Assignment::firstOrCreate(
            [
                'class_id' => $class1->id,
                'subject_id' => $subArt->id,
                'title' => 'Menggambar Alat Transportasi',
            ],
            [
                'teacher_id' => $teacherArt->id,
                'instructions' => 'Gambarkan satu jenis alat transportasi modern atau tradisional dengan teknik arsiran pensil atau pewarnaan cat air pada kertas A4.',
                'start_date' => Carbon::now()->subDays(1),
                'due_date' => Carbon::now()->addDays(4)->setTime(23, 59),
                'max_score' => 100,
                'allow_late_submission' => true,
                'late_penalty_percent' => 5,
                'is_published' => true,
            ]
        );

        // 6. Tugas Terlambat (Overdue Assignment) to demo "1 Tugas Terlambat"
        $assignOverdue = Assignment::firstOrCreate(
            [
                'class_id' => $class1->id,
                'subject_id' => $subEng->id,
                'title' => 'Descriptive Essay: My Favorite Place',
            ],
            [
                'teacher_id' => $teacherEng->id,
                'instructions' => 'Write a short descriptive text of around 250 words about your favorite vacation spot or historical building in Indonesia.',
                'start_date' => Carbon::now()->subDays(8),
                'due_date' => Carbon::now()->subDays(2)->setTime(23, 59),
                'max_score' => 100,
                'allow_late_submission' => true,
                'late_penalty_percent' => 20,
                'is_published' => true,
            ]
        );

        // Additional completed assignments for Alya to match "8 dari 12 tugas selesai"
        $completedAssignments = [
            ['sub' => $subMtk, 'teacher' => $teacherMtk, 'title' => 'Kuis Matriks & Vektor', 'score' => 95],
            ['sub' => $subMtk, 'teacher' => $teacherMtk, 'title' => 'Latihan Aljabar Linear', 'score' => 88],
            ['sub' => $subIndo, 'teacher' => $teacherIndo, 'title' => 'Analisis Teks Hasil Observasi', 'score' => 92],
            ['sub' => $subEng, 'teacher' => $teacherEng, 'title' => 'Grammar Quiz: Simple Past', 'score' => 85],
            ['sub' => $subEng, 'teacher' => $teacherEng, 'title' => 'Listening Comprehension Activity', 'score' => 90],
            ['sub' => $subProg, 'teacher' => $teacherProg, 'title' => 'Latihan Algoritma Percabangan & Perulangan', 'score' => 100],
            ['sub' => $subPpkn, 'teacher' => $teacherIndo, 'title' => 'Refleksi Sila-Sila Pancasila', 'score' => 90],
        ];

        foreach ($completedAssignments as $c) {
            $a = Assignment::firstOrCreate(
                [
                    'class_id' => $class1->id,
                    'subject_id' => $c['sub']->id,
                    'title' => $c['title'],
                ],
                [
                    'teacher_id' => $c['teacher']->id,
                    'instructions' => 'Tugas mandiri siswa untuk mengasah pemahaman materi.',
                    'start_date' => Carbon::now()->subDays(15),
                    'due_date' => Carbon::now()->subDays(5)->setTime(23, 59),
                    'max_score' => 100,
                    'allow_late_submission' => true,
                    'late_penalty_percent' => 0,
                    'is_published' => true,
                ]
            );

            // Submission for Alya
            AssignmentSubmission::firstOrCreate(
                [
                    'assignment_id' => $a->id,
                    'user_id' => $studentAlya->id,
                    'attempt_number' => 1,
                ],
                [
                    'status' => 'graded',
                    'submission_text' => 'Tugas telah selesai dikerjakan dengan baik.',
                    'submitted_at' => Carbon::now()->subDays(6),
                    'is_late' => false,
                    'score' => $c['score'],
                    'teacher_feedback' => 'Hasil pekerjaan sangat baik, pemahaman konsep tepat dan rapi!',
                    'graded_at' => Carbon::now()->subDays(5),
                    'graded_by' => $c['teacher']->id,
                ]
            );
        }

        // Submission for Alya on Tugas Coding Website
        AssignmentSubmission::firstOrCreate(
            [
                'assignment_id' => $assignCoding->id,
                'user_id' => $studentAlya->id,
                'attempt_number' => 1,
            ],
            [
                'status' => 'graded',
                'submission_text' => 'Berikut link repositori dan file proyek portofolio website pribadi yang responsif.',
                'submitted_at' => Carbon::now()->subDays(1),
                'is_late' => false,
                'score' => 90,
                'teacher_feedback' => 'Karya yang sangat bagus! Desain bersih, kode rapi dan responsif di mobile.',
                'graded_at' => Carbon::now()->subHours(18),
                'graded_by' => $teacherProg->id,
            ]
        );

        // 7. Schedules (Jadwal Pelajaran)
        $scheduleData = [
            ['day' => 1, 'sub' => $subMtk, 'teacher' => $teacherMtk, 'start' => '07:30', 'end' => '09:00', 'room' => 'Ruang 101'],
            ['day' => 1, 'sub' => $subIndo, 'teacher' => $teacherIndo, 'start' => '09:15', 'end' => '10:45', 'room' => 'Ruang 101'],
            ['day' => 2, 'sub' => $subProg, 'teacher' => $teacherProg, 'start' => '07:30', 'end' => '09:00', 'room' => 'Lab Komputer 1'],
            ['day' => 2, 'sub' => $subEng, 'teacher' => $teacherEng, 'start' => '09:15', 'end' => '10:45', 'room' => 'Ruang 101'],
            ['day' => 3, 'sub' => $subPpkn, 'teacher' => $teacherIndo, 'start' => '07:30', 'end' => '09:00', 'room' => 'Ruang 101'],
            ['day' => 3, 'sub' => $subMtk, 'teacher' => $teacherMtk, 'start' => '09:15', 'end' => '10:45', 'room' => 'Ruang 101'],
            ['day' => 4, 'sub' => $subArt, 'teacher' => $teacherArt, 'start' => '07:30', 'end' => '09:00', 'room' => 'Ruang Seni'],
            ['day' => 4, 'sub' => $subProg, 'teacher' => $teacherProg, 'start' => '09:15', 'end' => '10:45', 'room' => 'Lab Komputer 1'],
            ['day' => 5, 'sub' => $subIndo, 'teacher' => $teacherIndo, 'start' => '07:30', 'end' => '09:00', 'room' => 'Ruang 101'],
            ['day' => 5, 'sub' => $subEng, 'teacher' => $teacherEng, 'start' => '09:15', 'end' => '10:45', 'room' => 'Ruang 101'],
        ];

        foreach ($scheduleData as $sch) {
            Schedule::firstOrCreate(
                [
                    'class_id' => $class1->id,
                    'subject_id' => $sch['sub']->id,
                    'day_of_week' => $sch['day'],
                    'start_time' => $sch['start'],
                ],
                [
                    'teacher_id' => $sch['teacher']->id,
                    'end_time' => $sch['end'],
                    'room' => $sch['room'],
                ]
            );
        }

        // 8. Announcements
        Announcement::firstOrCreate(
            [
                'title' => 'Jadwal Ulangan Harian dan Penilaian Tengah Semester',
            ],
            [
                'user_id' => $admin->id,
                'class_id' => null, // General / all classes
                'content' => 'Diberitahukan kepada seluruh siswa bahwa Penilaian Tengah Semester (PTS) Ganjil akan dilaksanakan mulai tanggal 6 Oktober 2025. Harap mempersiapkan diri dan menyelesaikan seluruh tugas sebelum pekan ujian.',
                'is_pinned' => true,
                'published_at' => Carbon::now()->subDays(1)->setTime(10, 20),
            ]
        );

        Announcement::firstOrCreate(
            [
                'title' => 'Kegiatan Literasi Sekolah & Kunjungan Perpustakaan',
            ],
            [
                'user_id' => $teacherIndo->id,
                'class_id' => $class1->id,
                'content' => 'Setiap hari Jumat pagi pukul 06:45 - 07:15 diadakan kegiatan membaca senyap bersama di kelas masing-masing. Harap membawa satu buku non-pelajaran favorit kalian.',
                'is_pinned' => false,
                'published_at' => Carbon::now()->subDays(3)->setTime(8, 00),
            ]
        );

        // 9. In-App Notifications for Alya (matching mockup)
        $sampleNotifications = [
            [
                'type' => 'new_assignment',
                'title' => 'Tugas baru: Esai Pancasila',
                'message' => 'Dari Bu Rina (PPKN) • Batas waktu hari ini pukul 23:59 WIB',
                'url' => '/tugas/' . $assignPancasila->id,
                'created_at' => Carbon::now()->subHours(2),
                'is_read' => false,
            ],
            [
                'type' => 'due_soon',
                'title' => 'Deadline tugas Matematika',
                'message' => 'Tinggal 1 hari lagi untuk Latihan Soal Trigonometri. Jangan lupa kumpulkan!',
                'url' => '/tugas/' . $assignTrigo->id,
                'created_at' => Carbon::now()->subHours(5),
                'is_read' => false,
            ],
            [
                'type' => 'assignment_graded',
                'title' => 'Nilai tugas sudah keluar',
                'message' => 'Tugas Coding Website (Pemrograman Dasar) telah dinilai dengan skor 90/100.',
                'url' => '/tugas/' . $assignCoding->id,
                'created_at' => Carbon::yesterday()->setTime(15, 30),
                'is_read' => false,
            ],
            [
                'type' => 'new_announcement',
                'title' => 'Ada pengumuman baru',
                'message' => 'Jadwal ulangan harian minggu depan telah dipublikasikan oleh Tata Usaha.',
                'url' => '/pengumuman',
                'created_at' => Carbon::yesterday()->setTime(10, 20),
                'is_read' => true,
            ],
            [
                'type' => 'class_joined',
                'title' => 'Kamu masuk ke kelas baru',
                'message' => 'Pemrograman Dasar (X IPA 1) telah ditambahkan ke daftar kelas aktifmu.',
                'url' => '/kelas/' . $class1->id,
                'created_at' => Carbon::now()->subDays(2),
                'is_read' => true,
            ],
        ];

        foreach ($sampleNotifications as $n) {
            AppNotification::firstOrCreate(
                [
                    'user_id' => $studentAlya->id,
                    'title' => $n['title'],
                ],
                [
                    'type' => $n['type'],
                    'message' => $n['message'],
                    'url' => $n['url'],
                    'data' => [],
                    'is_read' => $n['is_read'],
                    'read_at' => $n['is_read'] ? Carbon::now()->subHour() : null,
                    'created_at' => $n['created_at'],
                ]
            );
        }
    }
}
