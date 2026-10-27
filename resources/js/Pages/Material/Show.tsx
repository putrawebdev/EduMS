import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    ArrowLeft,
    BookOpen,
    Download,
    ExternalLink,
    CheckCircle2,
    Circle,
    Trash2,
    Calendar,
    User as UserIcon,
    FileText,
} from 'lucide-react';

interface MaterialShowProps {
    material: {
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
    };
    isCompleted: boolean;
}

export default function MaterialShow({ material, isCompleted }: MaterialShowProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const canManage = user.role === 'admin' || (user.role === 'guru' && material.teacher?.id === user.id);

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return '-';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${material.title} - EduSpace LMS`} />

            <div className="space-y-6 max-w-4xl mx-auto">
                <Link
                    href={route('materials.index')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Daftar Materi</span>
                </Link>

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
                    {/* Header meta */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <span
                                className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
                                style={{ backgroundColor: material.subject?.color || '#0D827C' }}
                            >
                                {material.subject?.name}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                {material.classroom?.name}
                            </span>
                        </div>

                        {user.role === 'siswa' && (
                            <Link
                                href={route('materials.toggle-complete', material.id)}
                                method="post"
                                as="button"
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                                    isCompleted
                                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                        : 'bg-[#0D827C] text-white hover:bg-[#064E4B]'
                                }`}
                            >
                                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                <span>{isCompleted ? 'Selesai Dipelajari' : 'Tandai Sudah Selesai'}</span>
                            </Link>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                            {material.title}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <UserIcon className="w-4 h-4" />
                                Pengampu: {material.teacher?.name}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                Dipublikasikan: {new Date(material.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    {/* Content / Description */}
                    <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-line py-2">
                        {material.description || 'Tidak ada deskripsi tambahan untuk materi ini.'}
                    </div>

                    {/* Attachment Card */}
                    {material.file_path && (
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-teal-100 text-[#0D827C] flex items-center justify-center shrink-0">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate">
                                        {material.file_name || 'Lampiran Dokumen Materi'}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Ukuran: {formatFileSize(material.file_size)} • Format: {material.file_type?.toUpperCase() || 'FILE'}
                                    </p>
                                </div>
                            </div>

                            <a
                                href={`/storage/${material.file_path}`}
                                target="_blank"
                                rel="noreferrer"
                                download
                                className="px-4 py-2 bg-[#0D827C] hover:bg-[#064E4B] text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 self-start sm:self-center"
                            >
                                <Download className="w-4 h-4" />
                                <span>Unduh File</span>
                            </a>
                        </div>
                    )}

                    {/* External Link */}
                    {material.external_url && (
                        <div className="bg-teal-50/60 border border-teal-200/60 rounded-2xl p-4 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold text-teal-800">Tautan Bahan Belajar Luar</p>
                                <p className="text-xs text-teal-600 truncate max-w-md">{material.external_url}</p>
                            </div>
                            <a
                                href={material.external_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-1.5 bg-white text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold hover:bg-teal-50 flex items-center gap-1.5 transition"
                            >
                                <span>Buka Tautan</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    )}

                    {/* Admin/Teacher Action: Delete */}
                    {canManage && (
                        <div className="pt-6 border-t border-slate-100 flex items-center justify-end">
                            <Link
                                href={route('materials.destroy', material.id)}
                                method="delete"
                                as="button"
                                className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1.5"
                                onClick={(e) => {
                                    if (!confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Hapus Materi</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

