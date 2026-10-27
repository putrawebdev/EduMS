import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    GraduationCap,
    Users,
    BookOpen,
    ClipboardList,
    Plus,
    Search,
    ArrowRight,
    X,
    Calendar,
} from 'lucide-react';

interface ClassroomIndexProps {
    classes: {
        data: Array<{
            id: number;
            name: string;
            code: string;
            description: string | null;
            academic_year: string;
            semester: string;
            is_active: boolean;
            teacher: { name: string } | null;
            students_count: number;
            learning_materials_count: number;
            assignments_count: number;
        }>;
        links: Array<any>;
    };
    filters: { search?: string };
    teachers: Array<{ id: number; name: string }>;
}

export default function ClassroomIndex({ classes, filters, teachers }: ClassroomIndexProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const canCreate = user.role === 'admin' || user.role === 'guru';

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
        description: '',
        teacher_id: user.role === 'guru' ? user.id.toString() : '',
        academic_year: '2025/2026',
        semester: 'Ganjil',
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('classes.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Kelas Saya - EduSpace LMS" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                            {user.role === 'siswa' ? 'Kelas Saya' : 'Daftar Kelas'}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            {user.role === 'siswa'
                                ? 'Kelas aktif yang sedang kamu ikuti pada semester ini.'
                                : 'Kelola kelas, siswa anggota, jadwal, dan kurikulum pengajaran.'}
                        </p>
                    </div>

                    {canCreate && (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="px-4 py-2.5 bg-[#0D827C] hover:bg-[#064E4B] text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2 self-start sm:self-center"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Buat Kelas Baru</span>
                        </button>
                    )}
                </div>

                {/* Grid of Classes */}
                {classes.data.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs">
                        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-700 text-base">Belum Ada Kelas</h3>
                        <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                            {user.role === 'siswa'
                                ? 'Kamu belum terdaftar di kelas manapun. Hubungi guru atau admin sekolah.'
                                : 'Belum ada kelas yang dibuat. Silakan tambahkan kelas baru.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {classes.data.map((c) => (
                            <Link
                                key={c.id}
                                href={route('classes.show', c.id)}
                                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md hover:border-teal-200 transition group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D827C] flex items-center justify-center font-bold text-base shadow-xs group-hover:bg-[#0D827C] group-hover:text-white transition">
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                                            {c.code}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-800 mt-3 group-hover:text-[#0D827C] transition">
                                        {c.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                        {c.description || 'Peminatan Ilmu Pengetahuan & Kurikulum Merdeka'}
                                    </p>

                                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                                        <p>
                                            <span className="text-slate-400">Wali Kelas:</span>{' '}
                                            <span className="font-semibold text-slate-700">
                                                {c.teacher ? c.teacher.name : 'Belum ditentukan'}
                                            </span>
                                        </p>
                                        <p>
                                            <span className="text-slate-400">Tahun Ajaran:</span>{' '}
                                            <span className="font-semibold text-slate-700">
                                                {c.academic_year} ({c.semester})
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5 text-slate-400" />
                                            {c.students_count} Siswa
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                            {c.learning_materials_count} Materi
                                        </span>
                                    </div>
                                    <span className="text-[#0D827C] font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition">
                                        Buka <ArrowRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Create Classroom */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsCreateOpen(false)} />
                    <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Buat Kelas Baru</h3>
                            <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitCreate} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Nama Kelas
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: X IPA 1"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                />
                                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Kode Kelas
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: X-IPA-1"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                />
                                {errors.code && <p className="text-xs text-rose-500 mt-1">{errors.code}</p>}
                            </div>

                            {user.role === 'admin' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Wali Kelas
                                    </label>
                                    <select
                                        value={data.teacher_id}
                                        onChange={(e) => setData('teacher_id', e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    >
                                        <option value="">Pilih Wali Kelas (Opsional)</option>
                                        {teachers.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Tahun Ajaran
                                    </label>
                                    <input
                                        type="text"
                                        value={data.academic_year}
                                        onChange={(e) => setData('academic_year', e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Semester
                                    </label>
                                    <select
                                        value={data.semester}
                                        onChange={(e) => setData('semester', e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    >
                                        <option value="Ganjil">Ganjil</option>
                                        <option value="Genap">Genap</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Deskripsi Kelas
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Tuliskan keterangan singkat mengenai kelas ini..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
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
                                    {processing ? 'Menyimpan...' : 'Simpan Kelas'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

