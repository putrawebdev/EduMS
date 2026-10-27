import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    Calendar,
    Clock,
    Plus,
    BookOpen,
    Trash2,
    X,
    MapPin,
    User as UserIcon,
} from 'lucide-react';

interface ScheduleIndexProps {
    schedules: Array<{
        id: number;
        day_of_week: number;
        day_name: string;
        start_time: string;
        end_time: string;
        room: string | null;
        classroom: { id: number; name: string };
        subject: { id: number; name: string; color: string; icon: string };
        teacher: { id: number; name: string };
    }>;
    upcomingDeadlines: Array<{
        id: number;
        title: string;
        subject: string;
        subject_color: string;
        due_date_formatted: string;
        class_name: string;
    }>;
    classes: Array<{ id: number; name: string }>;
    subjects: Array<{ id: number; name: string }>;
}

export default function ScheduleIndex({
    schedules,
    upcomingDeadlines,
    classes,
    subjects,
}: ScheduleIndexProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const canManage = user.role === 'admin' || user.role === 'guru';

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        class_id: classes[0]?.id ? classes[0].id.toString() : '',
        subject_id: subjects[0]?.id ? subjects[0].id.toString() : '',
        day_of_week: '1',
        start_time: '07:30',
        end_time: '09:00',
        room: 'Ruang 101',
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('schedules.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const days = [
        { num: 1, name: 'Senin' },
        { num: 2, name: 'Selasa' },
        { num: 3, name: 'Rabu' },
        { num: 4, name: 'Kamis' },
        { num: 5, name: 'Jumat' },
        { num: 6, name: 'Sabtu' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Jadwal Pelajaran - EduSpace LMS" />

            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                            Jadwal & Kalender Akademik
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            Jadwal tatap muka harian sekolah dan agenda batas waktu penugasan (Zona Waktu: Asia/Jakarta).
                        </p>
                    </div>

                    {canManage && (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="px-4 py-2.5 bg-[#0D827C] hover:bg-[#064E4B] text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2 self-start sm:self-center"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Jadwal</span>
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Weekly Schedule Days */}
                    <div className="lg:col-span-8 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {days.map((day) => {
                                const daySchedules = schedules.filter((s) => s.day_of_week === day.num);
                                return (
                                    <div
                                        key={day.num}
                                        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                                <h3 className="font-bold text-base text-slate-800">{day.name}</h3>
                                                <span className="text-xs font-semibold text-slate-400">
                                                    {daySchedules.length} Sesi
                                                </span>
                                            </div>

                                            <div className="mt-3 space-y-2.5">
                                                {daySchedules.length === 0 ? (
                                                    <p className="text-xs text-slate-400 py-3 text-center">Tidak ada jadwal</p>
                                                ) : (
                                                    daySchedules.map((sch) => (
                                                        <div
                                                            key={sch.id}
                                                            className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2"
                                                        >
                                                            <div className="space-y-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span
                                                                        className="w-2.5 h-2.5 rounded-full"
                                                                        style={{ backgroundColor: sch.subject?.color || '#0D827C' }}
                                                                    />
                                                                    <h4 className="font-bold text-xs text-slate-800 truncate">
                                                                        {sch.subject?.name}
                                                                    </h4>
                                                                </div>
                                                                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                                    {sch.start_time.substring(0, 5)} - {sch.end_time.substring(0, 5)} WIB
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 flex items-center gap-2">
                                                                    <span>{sch.classroom?.name}</span>
                                                                    <span>•</span>
                                                                    <span>{sch.room || 'Kelas'}</span>
                                                                    <span>•</span>
                                                                    <span>{sch.teacher?.name}</span>
                                                                </p>
                                                            </div>

                                                            {canManage && (
                                                                <form
                                                                    onSubmit={(e) => {
                                                                        e.preventDefault();
                                                                        if (confirm('Hapus sesi jadwal ini?')) {
                                                                            window.location.href = route('schedules.destroy', sch.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    {/* Link to delete */}
                                                                </form>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upcoming Deadlines Column */}
                    <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[#0D827C]" />
                            <h3 className="font-bold text-base text-slate-800">Tenggat Waktu Mendatang</h3>
                        </div>

                        <div className="space-y-3">
                            {upcomingDeadlines.length === 0 ? (
                                <p className="text-xs text-slate-400 py-4 text-center">Tidak ada tenggat waktu dalam waktu dekat.</p>
                            ) : (
                                upcomingDeadlines.map((dl) => (
                                    <div
                                        key={dl.id}
                                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 hover:border-teal-200 transition"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                                                style={{ backgroundColor: dl.subject_color }}
                                            >
                                                {dl.subject}
                                            </span>
                                            <span className="text-[11px] font-bold text-slate-600">
                                                {dl.due_date_formatted}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-800 mt-1">
                                            {dl.title}
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            Kelas: {dl.class_name}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Create Schedule */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsCreateOpen(false)} />
                    <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Tambah Sesi Jadwal</h3>
                            <button onClick={() => setIsCreateOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitCreate} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Kelas
                                </label>
                                <select
                                    value={data.class_id}
                                    onChange={(e) => setData('class_id', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                >
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Mata Pelajaran
                                </label>
                                <select
                                    value={data.subject_id}
                                    onChange={(e) => setData('subject_id', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                >
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Hari
                                </label>
                                <select
                                    value={data.day_of_week}
                                    onChange={(e) => setData('day_of_week', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                >
                                    {days.map((d) => (
                                        <option key={d.num} value={d.num}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Waktu Mulai (HH:MM)
                                    </label>
                                    <input
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Waktu Selesai (HH:MM)
                                    </label>
                                    <input
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Ruangan (Opsional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Lab Komputer 1 / Ruang 101"
                                    value={data.room}
                                    onChange={(e) => setData('room', e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-[#0D827C] hover:bg-[#064E4B] rounded-xl shadow-xs disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Jadwal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

