import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    BookOpen,
    FileText,
    Plus,
    Search,
    Download,
    CheckCircle2,
    Circle,
    ArrowRight,
    ExternalLink,
    X,
} from 'lucide-react';

interface MaterialIndexProps {
    materials: {
        data: Array<{
            id: number;
            title: string;
            description: string | null;
            file_path: string | null;
            file_name: string | null;
            file_size: number | null;
            file_type: string | null;
            external_url: string | null;
            published_at: string;
            classroom: { id: number; name: string };
            subject: { id: number; name: string; color: string; icon: string };
            teacher: { id: number; name: string };
        }>;
        links: Array<any>;
    };
    completedMaterialIds: Array<number>;
    subjects: Array<{ id: number; name: string }>;
    classes: Array<{ id: number; name: string }>;
    filters: { subject_id?: string; class_id?: string; search?: string };
}

export default function MaterialIndex({
    materials,
    completedMaterialIds,
    subjects,
    classes,
    filters,
}: MaterialIndexProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const canUpload = user.role === 'admin' || user.role === 'guru';

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(filters.subject_id || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedClass, setSelectedClass] = useState(filters.class_id || '');
    const [subjectSearch, setSubjectSearch] = useState('');
    const normalizedSubjectSearch = subjectSearch.trim().toLocaleLowerCase();
    const filteredSubjects = subjects.filter((subject) =>
        subject.name.toLocaleLowerCase().includes(normalizedSubjectSearch),
    );

    const { data, setData, post, processing, errors, reset } = useForm({
        class_id: classes[0]?.id ? classes[0].id.toString() : '',
        subject_id: subjects[0]?.id ? subjects[0].id.toString() : '',
        title: '',
        description: '',
        external_url: '',
        file: null as File | null,
    });

    const submitUpload = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('materials.store'), {
            onSuccess: () => {
                setIsUploadOpen(false);
                reset();
            },
        });
    };

    const submitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('materials.index'),
            {
                search: searchTerm || undefined,
                subject_id: selectedSubject || undefined,
                class_id: selectedClass || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Materi Pembelajaran - EduSpace LMS" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                            Materi Pembelajaran
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            Akses modul, bahan bacaan, presentasi, dan tautan referensi belajar.
                        </p>
                    </div>

                    {canUpload && (
                        <button
                            onClick={() => setIsUploadOpen(true)}
                            className="px-4 py-2.5 bg-[#0D827C] hover:bg-[#064E4B] text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2 self-start sm:self-center"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Unggah Materi Baru</span>
                        </button>
                    )}
                </div>

                {/* Filters */}
                <form onSubmit={submitFilters} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_220px_auto] gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari judul atau deskripsi materi..."
                            aria-label="Cari materi"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-hidden focus:border-[#0D827C]"
                        />
                    </div>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        aria-label="Filter materi berdasarkan kelas"
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
                </form>

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
                                route('materials.index'),
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
                            href={route('materials.index', {
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

                {/* Materials Grid */}
                {materials.data.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-700 text-base">Tidak Ada Materi</h3>
                        <p className="text-sm text-slate-400 mt-1">Belum ada materi pembelajaran yang sesuai dengan filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {materials.data.map((mat) => {
                            const isCompleted = completedMaterialIds.includes(mat.id);
                            return (
                                <div
                                    key={mat.id}
                                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md hover:border-teal-200 transition group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <span
                                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                                                style={{ backgroundColor: mat.subject?.color || '#0D827C' }}
                                            >
                                                {mat.subject?.name}
                                            </span>

                                            {user.role === 'siswa' && (
                                                <Link
                                                    href={route('materials.toggle-complete', mat.id)}
                                                    method="post"
                                                    as="button"
                                                    title={isCompleted ? 'Sudah dipelajari' : 'Tandai selesai'}
                                                    className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full transition ${
                                                        isCompleted
                                                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                                            : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                                                    }`}
                                                >
                                                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                                                    <span>{isCompleted ? 'Selesai' : 'Tandai'}</span>
                                                </Link>
                                            )}
                                        </div>

                                        <h3 className="font-bold text-base text-slate-800 mt-3 group-hover:text-[#0D827C] transition">
                                            {mat.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                                            {mat.description || 'Pelajari bahan kajian materi ini untuk memahami topik yang sedang diajarkan di kelas.'}
                                        </p>

                                        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between font-medium">
                                            <span>Kelas: {mat.classroom?.name}</span>
                                            <span>Oleh: {mat.teacher?.name}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                                        <Link
                                            href={route('materials.show', mat.id)}
                                            className="text-xs font-bold text-[#0D827C] flex items-center gap-1 hover:underline"
                                        >
                                            Baca Rincian <ArrowRight className="w-3 h-3" />
                                        </Link>

                                        {mat.file_path && (
                                            <a
                                                href={`/storage/${mat.file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 rounded-lg bg-teal-50 text-[#0D827C] hover:bg-teal-100 transition"
                                                title="Unduh Lampiran"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {isUploadOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsUploadOpen(false)} />
                    <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Unggah Materi Pembelajaran</h3>
                            <button onClick={() => setIsUploadOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitUpload} className="mt-4 space-y-4">
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
                                    Judul Materi
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Identitas Dasar Trigonometri"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                />
                                {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Deskripsi & Instruksi Baca
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Jelaskan ringkasan materi atau petunjuk belajar siswa..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Unggah File Modul / Slide (Maks 50MB)
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#0D827C] hover:file:bg-teal-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Tautan Eksternal (Opsional)
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://youtube.com/... atau https://drive.google.com/..."
                                    value={data.external_url}
                                    onChange={(e) => setData('external_url', e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-[#0D827C] hover:bg-[#064E4B] rounded-xl shadow-xs disabled:opacity-50"
                                >
                                    {processing ? 'Mengunggah...' : 'Unggah Materi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
