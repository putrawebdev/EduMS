import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    GraduationCap,
    Users,
    ClipboardList,
    Clock,
    Plus,
    ArrowRight,
    CheckCircle,
    FileText,
    BookOpen,
} from 'lucide-react';

interface TeacherDashboardProps {
    role: string;
    subjects: Array<{ id: number; name: string; color: string }>;
    stats: {
        classes_count: number;
        total_students: number;
        assignments_count: number;
        pending_grading_count: number;
    };
    classes: Array<any>;
    recent_assignments: Array<any>;
    recent_submissions: Array<any>;
}

export default function TeacherDashboard({
    subjects,
    stats,
    classes,
    recent_assignments,
    recent_submissions,
}: TeacherDashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Guru - EduSpace LMS" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header Welcome */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-100/60 p-6 rounded-3xl border border-teal-100 shadow-xs">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                            Selamat Datang, {user.name}! 👨‍🏫
                        </h2>
                        <p className="text-sm text-slate-600 mt-1 font-medium">
                            Kelola materi, tugas, dan nilai siswa dengan mudah di satu tempat.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href={route('assignments.index')}
                            className="px-4 py-2.5 bg-[#0D827C] hover:bg-[#064E4B] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Buat Tugas</span>
                        </Link>
                        <Link
                            href={route('materials.index')}
                            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 transition flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Unggah Materi</span>
                        </Link>
                    </div>
                </div>

                {/* 4 Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0D827C] flex items-center justify-center">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Kelas Diampu</p>
                                <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats.classes_count}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0D827C] flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Total Siswa</p>
                                <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats.total_students}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0D827C] flex items-center justify-center">
                                <ClipboardList className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Tugas Diberikan</p>
                                <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats.assignments_count}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Perlu Dinilai</p>
                                <p className="text-2xl font-extrabold text-amber-600 mt-0.5">{stats.pending_grading_count}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-5 h-5 text-[#0D827C]" />
                        <h3 className="font-bold text-slate-800">Mata Pelajaran Diampu</h3>
                    </div>
                    {subjects.length === 0 ? (
                        <p className="text-sm text-slate-500">
                            Belum ada mata pelajaran yang ditetapkan. Hubungi administrator untuk mengatur mapel Anda.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {subjects.map((subject) => (
                                <span
                                    key={subject.id}
                                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                                    style={{ backgroundColor: subject.color || '#0D827C' }}
                                >
                                    {subject.name}
                                </span>
                            ))}
                        </div>
                    )}
                </section>

                {/* Submissions needing attention & Classes */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Submissions to grade */}
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 text-base">Pengumpulan Terbaru Siswa</h3>
                            <Link href={route('assignments.index')} className="text-xs font-semibold text-[#0D827C] flex items-center gap-1">
                                <span>Lihat Semua Tugas</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {recent_submissions.length === 0 ? (
                            <p className="text-sm text-slate-400 py-8 text-center">Belum ada pengumpulan baru.</p>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {recent_submissions.map((sub) => (
                                    <div key={sub.id} className="py-3 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs shrink-0">
                                                {sub.student?.name?.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">
                                                    {sub.student?.name}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {sub.assignment?.title} • {sub.assignment?.subject?.name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            {sub.status === 'graded' ? (
                                                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                                                    Nilai: {sub.score}
                                                </span>
                                            ) : (
                                                <Link
                                                    href={route('assignments.show', sub.assignment_id)}
                                                    className="text-xs font-semibold text-white bg-[#0D827C] hover:bg-[#064E4B] px-3 py-1.5 rounded-xl transition"
                                                >
                                                    Beri Nilai
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Classes Taught */}
                    <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 text-base">Kelas Diampu</h3>
                            <Link href={route('classes.index')} className="text-xs font-semibold text-[#0D827C] flex items-center gap-1">
                                <span>Detail</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {classes.map((c) => (
                                <Link
                                    key={c.id}
                                    href={route('classes.show', c.id)}
                                    className="p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-slate-50 transition block"
                                >
                                    <h4 className="font-bold text-sm text-slate-800">{c.name}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{c.description || 'Tidak ada deskripsi'}</p>
                                    <div className="mt-2 text-[11px] text-teal-700 font-medium">
                                        {c.academic_year} • Semester {c.semester}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
