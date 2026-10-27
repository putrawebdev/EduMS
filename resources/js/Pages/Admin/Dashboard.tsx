import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Users,
    GraduationCap,
    BookOpen,
    FileText,
    Settings,
    ArrowRight,
    UserCheck,
    CheckCircle,
    Plus,
} from 'lucide-react';

interface AdminDashboardProps {
    role: string;
    stats: {
        total_students: number;
        total_teachers: number;
        total_classes: number;
        total_subjects: number;
        total_assignments: number;
        total_materials: number;
    };
    recent_users: Array<any>;
    classes: Array<any>;
    announcements: Array<any>;
}

export default function AdminDashboard({
    stats,
    recent_users,
    classes,
    announcements,
}: AdminDashboardProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard - EduSpace LMS" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Admin Welcome */}
                <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-100/60 p-6 rounded-3xl border border-teal-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                            Panel Administrator EduSpace LMS 🛡️
                        </h2>
                        <p className="text-sm text-slate-600 mt-1 font-medium">
                            Kelola pengguna sekolah, kelas, mata pelajaran, serta pengaturan sistem secara terpusat.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href={route('admin.users.index')}
                            className="px-4 py-2.5 bg-[#0D827C] hover:bg-[#064E4B] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Pengguna</span>
                        </Link>
                        <Link
                            href={route('admin.subjects.index')}
                            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 transition flex items-center gap-2"
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>Mata Pelajaran</span>
                        </Link>
                    </div>
                </div>

                {/* 6 Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                        <p className="text-xs text-slate-500 font-medium">Total Siswa</p>
                        <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats.total_students}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                        <p className="text-xs text-slate-500 font-medium">Total Guru</p>
                        <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats.total_teachers}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                        <p className="text-xs text-slate-500 font-medium">Total Kelas</p>
                        <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats.total_classes}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                        <p className="text-xs text-slate-500 font-medium">Mata Pelajaran</p>
                        <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats.total_subjects}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                        <p className="text-xs text-slate-500 font-medium">Total Tugas</p>
                        <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats.total_assignments}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                        <p className="text-xs text-slate-500 font-medium">Total Materi</p>
                        <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats.total_materials}</p>
                    </div>
                </div>

                {/* 2 Columns: Recent Users & Recent Classes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Users */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 text-base">Pengguna Terbaru</h3>
                            <Link href={route('admin.users.index')} className="text-xs font-semibold text-[#0D827C] flex items-center gap-1">
                                <span>Kelola Pengguna</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {recent_users.map((u) => (
                                <div key={u.id} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                                            {u.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                                            <p className="text-xs text-slate-500">{u.email}</p>
                                        </div>
                                    </div>

                                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase ${
                                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                        u.role === 'guru' ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {u.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Classes Management */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 text-base">Daftar Kelas</h3>
                            <Link href={route('classes.index')} className="text-xs font-semibold text-[#0D827C] flex items-center gap-1">
                                <span>Lihat Semua</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {classes.map((c) => (
                                <div key={c.id} className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{c.name} ({c.code})</p>
                                        <p className="text-xs text-slate-500">Wali Kelas: {c.teacher ? c.teacher.name : '-'}</p>
                                    </div>
                                    <Link
                                        href={route('classes.show', c.id)}
                                        className="text-xs font-semibold text-[#0D827C] hover:underline"
                                    >
                                        Detail Kelas
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

