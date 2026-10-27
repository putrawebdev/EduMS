import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    ClipboardList,
    Clock,
    Plus,
    Search,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    X,
    Calendar,
} from 'lucide-react';

interface AssignmentIndexProps {
    assignments: {
        data: Array<{
            id: number;
            title: string;
            instructions: string;
            due_date: string;
            max_score: number;
            classroom: { id: number; name: string };
            subject: { id: number; name: string; color: string; icon: string };
            teacher: { id: number; name: string };
            student_status?: string;
            student_status_type?: 'success' | 'warning' | 'danger';
            student_submission?: any;
            submissions_count?: number;
            graded_count?: number;
        }>;
        links: Array<any>;
    };
    subjects: Array<{ id: number; name: string }>;
    classes: Array<{ id: number; name: string }>;
    filters: { subject_id?: string; class_id?: string; status?: string; search?: string };
}

export default function AssignmentIndex({
    assignments,
    subjects,
    classes,
    filters,
}: AssignmentIndexProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const canCreate = user.role === 'admin' || user.role === 'guru';

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(filters.subject_id || '');
    const [selectedClass, setSelectedClass] = useState(filters.class_id || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [subjectSearch, setSubjectSearch] = useState('');
    const normalizedSubjectSearch = subjectSearch.trim().toLocaleLowerCase();
    const filteredSubjects = subjects.filter((subject) =>
        subject.name.toLocaleLowerCase().includes(normalizedSubjectSearch),
    );

    const { data, setData, post, processing, errors, reset } = useForm({
        class_id: classes[0]?.id ? classes[0].id.toString() : '',
        subject_id: subjects[0]?.id ? subjects[0].id.toString() : '',
        title: '',
        instructions: '',
        due_date: '',
        max_score: 100,
        allow_late_submission: true,
        late_penalty_percent: 10,
        file: null as File | null,
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('assignments.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const submitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('assignments.index'),
            {
                search: searchTerm || undefined,
                subject_id: selectedSubject || undefined,
                class_id: selectedClass || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const renderBadge = (statusType?: string, statusText?: string) => {
        if (!statusText) return null;
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

    return (
        <AuthenticatedLayout>
            <Head title="Daftar Tugas - EduSpace LMS" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                            {user.role === 'siswa' ? 'Tugas Saya' : 'Daftar Tugas & Penilaian'}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            {user.role === 'siswa'
                                ? 'Lihat instruksi, batas waktu pengerjaan, dan kumpulkan hasil tugasmu.'
                                : 'Kelola tugas kelas, periksa pengumpulan jawaban, dan berikan evaluasi nilai.'}
                        </p>
                    </div>

                    {canCreate && (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="px-4 py-2.5 bg-[#0D827C] hover:bg-[#064E4B] text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2 self-start sm:self-center"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Buat Tugas Baru</span>
                        </button>
                    )}
                </div>

                {/* Assignment filters */}
                <form onSubmit={submitFilters} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_220px_auto] gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari judul atau instruksi tugas..."
                                aria-label="Cari tugas"
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-hidden focus:border-[#0D827C]"
                            />
                        </div>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            aria-label="Filter tugas berdasarkan kelas"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-hidden focus:border-[#0D827C]"
                        >
                            <option value="">Semua Kelas</option>
                            {classes.map((classroom) => (
                                <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="rounded-xl bg-[#0D827C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#064E4B]"
                        >
                            Cari
                        </button>
                    </div>

                {/* Subject filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="relative min-w-[220px] flex-1 sm:flex-none sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="search"
                            value={subjectSearch}
                            onChange={(e) => setSubjectSearch(e.target.value)}
                            placeholder="Cari mata pelajaran..."
                            aria-label="Cari mata pelajaran"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-hidden focus:border-[#0D827C]"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedSubject('');
                            setSubjectSearch('');
                            router.get(
                                route('assignments.index'),
                                {
                                    search: searchTerm || undefined,
                                    class_id: selectedClass || undefined,
                                },
                                { preserveState: true, replace: true },
                            );
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                            !selectedSubject ? 'bg-[#0D827C] text-white' : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                    >
                        Semua Pelajaran
                    </button>
                    {filteredSubjects.map((sub) => (
                        <Link
                            key={sub.id}
                            href={route('assignments.index', {
                                subject_id: sub.id,
                                class_id: selectedClass || undefined,
                                search: searchTerm || undefined,
                            })}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                                selectedSubject === sub.id.toString()
                                    ? 'bg-[#0D827C] text-white'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            {sub.name}
                        </Link>
                    ))}
                    {normalizedSubjectSearch && filteredSubjects.length === 0 && (
                        <span className="text-sm text-slate-500">Mata pelajaran tidak ditemukan.</span>
                    )}
                </div>
                </form>

                {/* Assignments List */}
                {assignments.data.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs">
                        <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-700 text-base">Tidak Ada Tugas</h3>
                        <p className="text-sm text-slate-400 mt-1">Saat ini belum ada tugas yang tersedia pada kriteria ini.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {assignments.data.map((a) => (
                            <Link
                                key={a.id}
                                href={route('assignments.show', a.id)}
                                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md hover:border-teal-200 transition group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2">
                                        <span
                                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-xs"
                                            style={{ backgroundColor: a.subject?.color || '#0D827C' }}
                                        >
                                            {a.subject?.name}
                                        </span>

                                        {user.role === 'siswa' ? (
                                            renderBadge(a.student_status_type, a.student_status)
                                        ) : (
                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                                {a.submissions_count} Pengumpulan
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-base text-slate-800 mt-3 group-hover:text-[#0D827C] transition">
                                        {a.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                                        {a.instructions}
                                    </p>

                                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                                        <div className="flex items-center gap-1.5 font-medium text-slate-600">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            <span>
                                                Batas Waktu: {new Date(a.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400">
                                            Kelas: {a.classroom?.name} • Oleh: {a.teacher?.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500">
                                        Nilai Maks: {a.max_score}
                                    </span>
                                    <span className="text-xs font-bold text-[#0D827C] flex items-center gap-1 group-hover:translate-x-1 transition">
                                        Buka Tugas <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Create Assignment */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsCreateOpen(false)} />
                    <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Buat Tugas Baru</h3>
                            <button onClick={() => setIsCreateOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitCreate} className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
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
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Judul Tugas
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Latihan Soal Trigonometri"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                />
                                {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Instruksi Tugas
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Tuliskan petunjuk pengerjaan tugas secara rinci..."
                                    value={data.instructions}
                                    onChange={(e) => setData('instructions', e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                />
                                {errors.instructions && <p className="text-xs text-rose-500 mt-1">{errors.instructions}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Batas Waktu (Deadline)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                        className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                        required
                                    />
                                    {errors.due_date && <p className="text-xs text-rose-500 mt-1">{errors.due_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Nilai Maksimum
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={data.max_score}
                                        onChange={(e) => setData('max_score', parseInt(e.target.value) || 100)}
                                        className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Lampiran Soal / Lembar Kerja (Opsional)
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#0D827C] hover:file:bg-teal-100"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="allow_late"
                                    checked={data.allow_late_submission}
                                    onChange={(e) => setData('allow_late_submission', e.target.checked)}
                                    className="w-4 h-4 text-[#0D827C] rounded-sm focus:ring-[#0D827C]"
                                />
                                <label htmlFor="allow_late" className="text-xs font-medium text-slate-700">
                                    Izinkan pengumpulan terlambat dengan potongan nilai
                                </label>
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
                                    {processing ? 'Menyimpan...' : 'Terbitkan Tugas'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
