import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    Bell,
    Pin,
    Plus,
    Calendar,
    User as UserIcon,
    Trash2,
    X,
} from 'lucide-react';

interface AnnouncementIndexProps {
    announcements: {
        data: Array<{
            id: number;
            title: string;
            content: string;
            is_pinned: boolean;
            created_at: string;
            author: { id: number; name: string };
            classroom: { id: number; name: string } | null;
        }>;
        links: Array<any>;
    };
    classes: Array<{ id: number; name: string }>;
}

export default function AnnouncementIndex({ announcements, classes }: AnnouncementIndexProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const canCreate = user.role === 'admin' || user.role === 'guru';

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
        class_id: '',
        is_pinned: false,
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('announcements.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pengumuman Sekolah - EduSpace LMS" />

            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                            Pengumuman Sekolah
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            Informasi resmi kegiatan akademik, ujian, dan pengumuman kelas.
                        </p>
                    </div>

                    {canCreate && (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="px-4 py-2.5 bg-[#0D827C] hover:bg-[#064E4B] text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2 self-start sm:self-center"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Buat Pengumuman</span>
                        </button>
                    )}
                </div>

                {/* Announcement Cards */}
                <div className="space-y-4">
                    {announcements.data.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs">
                            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="font-bold text-slate-700 text-base">Belum Ada Pengumuman</h3>
                            <p className="text-sm text-slate-400 mt-1">Saat ini belum ada pengumuman terbaru yang dipublikasikan.</p>
                        </div>
                    ) : (
                        announcements.data.map((ann) => (
                            <div
                                key={ann.id}
                                className={`bg-white rounded-2xl p-6 border shadow-xs transition ${
                                    ann.is_pinned ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        {ann.is_pinned && (
                                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                                                <Pin className="w-3 h-3" /> Disematkan
                                            </span>
                                        )}
                                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                            {ann.classroom ? `Kelas ${ann.classroom.name}` : 'Semua Siswa & Guru'}
                                        </span>
                                    </div>

                                    {user.role === 'admin' && (
                                        <form
                                            onSubmit={(e) => {
                                                if (!confirm('Hapus pengumuman ini?')) e.preventDefault();
                                            }}
                                            action={route('announcements.destroy', ann.id)}
                                            method="POST"
                                        >
                                            <input type="hidden" name="_method" value="DELETE" />
                                            <button
                                                type="submit"
                                                className="text-slate-400 hover:text-rose-600 p-1"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </form>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 mt-3">
                                    {ann.title}
                                </h3>

                                <div className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                    {ann.content}
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <UserIcon className="w-3.5 h-3.5" /> Oleh: {ann.author?.name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(ann.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Create Announcement */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsCreateOpen(false)} />
                    <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Buat Pengumuman Baru</h3>
                            <button onClick={() => setIsCreateOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitCreate} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Target Penerima
                                </label>
                                <select
                                    value={data.class_id}
                                    onChange={(e) => setData('class_id', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                >
                                    <option value="">Semua Siswa & Guru (Umum)</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>Kelas {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Judul Pengumuman
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Jadwal Ujian Tengah Semester"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                />
                                {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Isi Pengumuman
                                </label>
                                <textarea
                                    rows={5}
                                    placeholder="Tuliskan isi pengumuman secara jelas..."
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                />
                                {errors.content && <p className="text-xs text-rose-500 mt-1">{errors.content}</p>}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="pinned"
                                    checked={data.is_pinned}
                                    onChange={(e) => setData('is_pinned', e.target.checked)}
                                    className="w-4 h-4 text-[#0D827C] rounded-sm focus:ring-[#0D827C]"
                                />
                                <label htmlFor="pinned" className="text-xs font-medium text-slate-700">
                                    Sematkan pengumuman di posisi teratas
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
                                    {processing ? 'Menyimpan...' : 'Terbitkan Pengumuman'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

