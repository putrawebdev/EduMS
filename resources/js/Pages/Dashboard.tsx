import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    Users,
    ClipboardList,
    Clock,
    AlertTriangle,
    ArrowRight,
    Calculator,
    BookOpen,
    Languages,
    Code,
    Scale,
    Palette,
    FileText,
    ChevronLeft,
    ChevronRight,
    Award,
    CheckCircle2,
    Calendar,
    Sparkles,
} from 'lucide-react';

interface DashboardProps {
    role: string;
    stats: {
        enrolled_classes: number;
        total_school_classes: number;
        uncompleted_assignments: number;
        total_assignments: number;
        completed_assignments: number;
        due_today_assignments: number;
        overdue_assignments: number;
        overall_progress_percentage: number;
    };
    classes: Array<{
        id: number;
        name: string;
        code: string;
        color: string;
        icon: string;
        class_name: string;
        materials_count: number;
        assignments_count: number;
        progress_percentage: number;
    }>;
    recent_assignments: Array<{
        id: number;
        title: string;
        subject_name: string;
        subject_code: string;
        subject_color: string;
        subject_icon: string;
        class_name: string;
        due_date_formatted: string;
        due_date_raw: string;
        status: string;
        status_type: 'success' | 'warning' | 'danger';
        has_submitted: boolean;
        score: number | null;
    }>;
    progress_breakdown: Array<{
        subject_name: string;
        color: string;
        icon: string;
        progress_percentage: number;
    }>;
    notifications: Array<{
        id: number;
        type: string;
        title: string;
        message: string;
        url: string | null;
        is_read: boolean;
        time_ago: string;
    }>;
    schedules: Array<any>;
    announcements: Array<any>;
}

export default function Dashboard({
    stats,
    classes,
    recent_assignments,
    progress_breakdown,
    notifications,
    announcements,
}: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    // Calendar state
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());

    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const currentYear = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth();

    const getSubjectIcon = (iconName: string) => {
        switch (iconName) {
            case 'Calculator':
                return <Calculator className="w-5 h-5" />;
            case 'BookOpen':
                return <BookOpen className="w-5 h-5" />;
            case 'Languages':
                return <Languages className="w-5 h-5" />;
            case 'Code':
                return <Code className="w-5 h-5" />;
            case 'Scale':
                return <Scale className="w-5 h-5" />;
            case 'Palette':
                return <Palette className="w-5 h-5" />;
            default:
                return <FileText className="w-5 h-5" />;
        }
    };

    const getStatusBadge = (statusType: string, statusText: string) => {
        if (statusType === 'success') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-[#0D827C] border border-teal-200">
                    {statusText}
                </span>
            );
        }
        if (statusType === 'warning') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    {statusText}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                {statusText}
            </span>
        );
    };

    // Calendar days generator
    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    const firstDayIndex = (new Date(currentYear, currentMonthIndex, 1).getDay() + 6) % 7; // Monday start
    const calendarDays = [];
    for (let i = 0; i < firstDayIndex; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard - EduSpace LMS" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* 1. TOP WELCOME BANNER */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-50/90 via-emerald-50/70 to-teal-100/60 border border-teal-100 p-6 sm:p-7 shadow-xs">
                    <div className="relative z-10 max-w-2xl">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl sm:text-3xl">👋</span>
                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                                Halo, {user.name}!
                            </h2>
                        </div>
                        <p className="mt-1.5 text-sm sm:text-base text-slate-600 font-medium">
                            Semangat terus belajar dan raih cita-citamu ✨
                        </p>
                    </div>

                    {/* Decorative Books & Plant Vector */}
                    <div className="absolute right-4 -bottom-6 hidden md:flex items-end gap-3 pointer-events-none opacity-80">
                        <div className="w-16 h-28 bg-[#0D827C]/20 rounded-t-xl rotate-6" />
                        <div className="w-20 h-32 bg-[#064E4B]/25 rounded-t-xl -rotate-3" />
                        <div className="w-14 h-24 bg-teal-600/30 rounded-t-xl rotate-12" />
                    </div>
                </div>

                {/* 2. STATS SUMMARY CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                    {/* Card 1: Kelas Diikuti */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs hover:shadow-md transition">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-teal-50 text-[#0D827C] flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-slate-500">Kelas Diikuti</p>
                                <div className="flex items-baseline gap-1.5 mt-0.5">
                                    <span className="text-xl sm:text-2xl font-extrabold text-slate-800">
                                        {stats.enrolled_classes}
                                    </span>
                                    <span className="text-[11px] sm:text-xs text-slate-400">
                                        dari {stats.total_school_classes} kelas
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Tugas Belum Selesai */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs hover:shadow-md transition">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-teal-50 text-[#0D827C] flex items-center justify-center shrink-0">
                                <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-slate-500">Tugas Belum Selesai</p>
                                <div className="flex items-baseline gap-1.5 mt-0.5">
                                    <span className="text-xl sm:text-2xl font-extrabold text-slate-800">
                                        {stats.uncompleted_assignments}
                                    </span>
                                    <span className="text-[11px] sm:text-xs text-slate-400">
                                        dari {stats.total_assignments} tugas
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Deadline Hari Ini */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs hover:shadow-md transition">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-teal-50 text-[#0D827C] flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-slate-500">Deadline Hari Ini</p>
                                <div className="flex items-baseline gap-1.5 mt-0.5">
                                    <span className="text-xl sm:text-2xl font-extrabold text-slate-800">
                                        {stats.due_today_assignments}
                                    </span>
                                    <span className="text-[11px] sm:text-xs text-slate-400">tugas</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Tugas Terlambat */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs hover:shadow-md transition">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-slate-500">Tugas Terlambat</p>
                                <div className="flex items-baseline gap-1.5 mt-0.5">
                                    <span className="text-xl sm:text-2xl font-extrabold text-rose-600">
                                        {stats.overdue_assignments}
                                    </span>
                                    <span className="text-[11px] sm:text-xs text-slate-400">tugas</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. MAIN DASHBOARD CONTENT GRID (Left 8 cols, Right 4 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT & MIDDLE COLUMN */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* KELAS SAYA */}
                        <div className="space-y-3.5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                                    Kelas Saya
                                </h3>
                                <Link
                                    href={route('classes.index')}
                                    className="text-xs sm:text-sm font-semibold text-[#0D827C] hover:text-[#064E4B] flex items-center gap-1 transition"
                                >
                                    <span>Lihat Semua</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* Class Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                {classes.slice(0, 4).map((cls) => (
                                    <Link
                                        key={cls.id}
                                        href={route('classes.index')}
                                        className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:shadow-md hover:border-teal-200 transition group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                                                style={{ backgroundColor: cls.color || '#0D827C' }}
                                            >
                                                {getSubjectIcon(cls.icon)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm text-slate-800 truncate group-hover:text-[#0D827C] transition">
                                                    {cls.name}
                                                </h4>
                                                <p className="text-[11px] text-slate-400 font-medium">
                                                    {cls.class_name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                                            <span>{cls.materials_count} materi • {cls.assignments_count} tugas</span>
                                            <span className="font-bold text-slate-700">{cls.progress_percentage}%</span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${cls.progress_percentage}%`,
                                                    backgroundColor: cls.color || '#0D827C',
                                                }}
                                            />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* TUGAS TERBARU TABLE */}
                        <div className="space-y-3.5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                                    Tugas Terbaru
                                </h3>
                                <Link
                                    href={route('assignments.index')}
                                    className="text-xs sm:text-sm font-semibold text-[#0D827C] hover:text-[#064E4B] flex items-center gap-1 transition"
                                >
                                    <span>Lihat Semua</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50/80 text-xs font-semibold text-slate-400 border-b border-slate-100">
                                            <tr>
                                                <th className="py-3 px-4">Judul Tugas</th>
                                                <th className="py-3 px-4 hidden sm:table-cell">Mata Pelajaran</th>
                                                <th className="py-3 px-4">Deadline</th>
                                                <th className="py-3 px-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {recent_assignments.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="py-8 text-center text-slate-400">
                                                        Belum ada tugas yang aktif.
                                                    </td>
                                                </tr>
                                            ) : (
                                                recent_assignments.map((assignment) => (
                                                    <tr
                                                        key={assignment.id}
                                                        className="hover:bg-slate-50/70 transition group"
                                                    >
                                                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                                                            <Link
                                                                href={route('assignments.show', assignment.id)}
                                                                className="flex items-center gap-2.5 group-hover:text-[#0D827C] transition"
                                                            >
                                                                <div
                                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                                                                    style={{ backgroundColor: assignment.subject_color }}
                                                                >
                                                                    {getSubjectIcon(assignment.subject_icon)}
                                                                </div>
                                                                <span className="truncate max-w-[180px] sm:max-w-xs">
                                                                    {assignment.title}
                                                                </span>
                                                            </Link>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-slate-500 hidden sm:table-cell">
                                                            {assignment.subject_name}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                                                            {assignment.due_date_formatted}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                            <Link href={route('assignments.show', assignment.id)}>
                                                                {getStatusBadge(assignment.status_type, assignment.status)}
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (Calendar, Learning Progress, Notifications) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* 1. KALENDER AKADEMIK */}
                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm text-slate-800">Kalender Akademik</h3>
                                <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                                    <span>{monthNames[currentMonthIndex]} {currentYear}</span>
                                    <div className="flex items-center ml-2">
                                        <button
                                            onClick={() => setCurrentDate(new Date(currentYear, currentMonthIndex - 1, 1))}
                                            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentDate(new Date(currentYear, currentMonthIndex + 1, 1))}
                                            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                                        >
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Calendar Table */}
                            <div className="grid grid-cols-7 text-center text-xs text-slate-400 font-semibold mb-2">
                                <span>Sen</span>
                                <span>Sel</span>
                                <span>Rab</span>
                                <span>Kam</span>
                                <span>Jum</span>
                                <span>Sab</span>
                                <span>Min</span>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
                                {calendarDays.map((day, idx) => (
                                    <div key={idx} className="h-7 flex items-center justify-center">
                                        {day !== null ? (
                                            <button
                                                onClick={() => setSelectedDate(day)}
                                                className={`w-7 h-7 rounded-full flex items-center justify-center transition ${day === selectedDate
                                                        ? 'bg-[#064E4B] text-white font-bold shadow-xs'
                                                        : 'text-slate-700 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. PROGRES BELAJAR */}
                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-4">
                            <h3 className="font-bold text-sm text-slate-800">Progres Belajar</h3>

                            <div className="flex items-center gap-4">
                                {/* Circular Gauge */}
                                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            className="text-slate-100"
                                            strokeWidth="3.5"
                                            stroke="currentColor"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <path
                                            className="text-[#0D827C]"
                                            strokeDasharray={`${stats.overall_progress_percentage}, 100`}
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-base font-extrabold text-slate-800">
                                            {stats.overall_progress_percentage}%
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-slate-700">Total Penyelesaian Tugas</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {stats.completed_assignments} dari {stats.total_assignments} tugas
                                    </p>
                                </div>
                            </div>

                            {/* Subject progress bars */}
                            <div className="space-y-2.5 pt-2 border-t border-slate-100">
                                {progress_breakdown.slice(0, 4).map((p, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-md flex items-center justify-center text-white text-[9px]"
                                                    style={{ backgroundColor: p.color }}
                                                >
                                                    {getSubjectIcon(p.icon)}
                                                </div>
                                                <span className="font-semibold text-slate-700">{p.subject_name}</span>
                                            </div>
                                            <span className="font-bold text-slate-600">{p.progress_percentage}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{ width: `${p.progress_percentage}%`, backgroundColor: p.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. NOTIFIKASI WIDGET */}
                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-3.5">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-sm text-slate-800">Notifikasi</h3>
                                <Link
                                    href={route('notifications.index')}
                                    className="text-xs font-semibold text-[#0D827C] hover:text-[#064E4B] flex items-center gap-1 transition"
                                >
                                    <span>Lihat Semua</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {notifications.length === 0 ? (
                                    <p className="text-xs text-slate-400 py-3 text-center">Belum ada notifikasi baru.</p>
                                ) : (
                                    notifications.map((n) => (
                                        <Link
                                            key={n.id}
                                            href={n.url || route('notifications.index')}
                                            className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition group relative"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-teal-50 text-[#0D827C] flex items-center justify-center shrink-0 mt-0.5">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0 pr-3">
                                                <p className="text-xs font-bold text-slate-800 group-hover:text-[#0D827C] transition truncate">
                                                    {n.title}
                                                </p>
                                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                                    {n.message}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    {n.time_ago}
                                                </p>
                                            </div>
                                            {!n.is_read && (
                                                <div className="w-2 h-2 rounded-full bg-rose-500 absolute top-3 right-2" />
                                            )}
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
