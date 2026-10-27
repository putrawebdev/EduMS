import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    BookOpen,
    Plus,
    Edit3,
    Trash2,
    Calculator,
    Languages,
    Code,
    Scale,
    Palette,
    FileText,
    X,
} from 'lucide-react';

interface AdminSubjectsProps {
    subjects: {
        data: Array<{
            id: number;
            name: string;
            code: string;
            color: string;
            icon: string;
            description: string | null;
            classes_count: number;
            learning_materials_count: number;
            assignments_count: number;
        }>;
        links: Array<any>;
    };
}

export default function AdminSubjects({ subjects }: AdminSubjectsProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<any | null>(null);

    const { data: createData, setData: setCreateData, post: postCreate, processing: createProcessing, reset: resetCreate } = useForm({
        name: '',
        code: '',
        color: '#0D827C',
        icon: 'BookOpen',
        description: '',
    });

    const { data: editData, setData: setEditData, put: putEdit, processing: editProcessing, reset: resetEdit } = useForm({
        name: '',
        code: '',
        color: '#0D827C',
        icon: 'BookOpen',
        description: '',
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        postCreate(route('admin.subjects.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreate();
            },
        });
    };

    const openEdit = (sub: any) => {
        setEditingSubject(sub);
        setEditData({
            name: sub.name,
            code: sub.code,
            color: sub.color || '#0D827C',
            icon: sub.icon || 'BookOpen',
            description: sub.description || '',
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSubject) return;
        putEdit(route('admin.subjects.update', editingSubject.id), {
            onSuccess: () => {
                setEditingSubject(null);
                resetEdit();
            },
        });
    };

    const renderIcon = (iconName: string) => {
        switch (iconName) {
            case 'Calculator': return <Calculator className="w-5 h-5" />;
            case 'BookOpen': return <BookOpen className="w-5 h-5" />;
            case 'Languages': return <Languages className="w-5 h-5" />;
            case 'Code': return <Code className="w-5 h-5" />;
            case 'Scale': return <Scale className="w-5 h-5" />;
            case 'Palette': return <Palette className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Mata Pelajaran - EduSpace LMS" />

            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                            Kelola Mata Pelajaran
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            Daftar kurikulum mata pelajaran, kode, palet warna, dan ikon identitas.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="px-4 py-2.5 bg-[#0D827C] hover:bg-[#064E4B] text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2 self-start sm:self-center"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Mata Pelajaran</span>
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {subjects.data.map((sub) => (
                        <div
                            key={sub.id}
                            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-2">
                                    <div
                                        className="w-12 h-12 rounded-2xl text-white flex items-center justify-center font-bold shadow-xs"
                                        style={{ backgroundColor: sub.color }}
                                    >
                                        {renderIcon(sub.icon)}
                                    </div>
                                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                                        {sub.code}
                                    </span>
                                </div>

                                <h3 className="font-bold text-lg text-slate-800 mt-3">{sub.name}</h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                    {sub.description || 'Kurikulum mata pelajaran pokok'}
                                </p>

                                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 space-y-1">
                                    <p>{sub.classes_count} Kelas Aktif • {sub.learning_materials_count} Materi • {sub.assignments_count} Tugas</p>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-end gap-2">
                                <button
                                    onClick={() => openEdit(sub)}
                                    className="p-1.5 text-slate-400 hover:text-teal-700 rounded-lg hover:bg-slate-100"
                                    title="Edit"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <Link
                                    href={route('admin.subjects.destroy', sub.id)}
                                    method="delete"
                                    as="button"
                                    onClick={(e) => {
                                        if (!confirm(`Hapus mata pelajaran ${sub.name}?`)) e.preventDefault();
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                                    title="Hapus"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Create */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsCreateOpen(false)} />
                    <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Tambah Mata Pelajaran</h3>
                            <button onClick={() => setIsCreateOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitCreate} className="mt-4 space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Nama Mata Pelajaran
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Matematika"
                                    value={createData.name}
                                    onChange={(e) => setCreateData('name', e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Kode Singkat
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="MTK"
                                        value={createData.code}
                                        onChange={(e) => setCreateData('code', e.target.value)}
                                        className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Warna Label
                                    </label>
                                    <input
                                        type="color"
                                        value={createData.color}
                                        onChange={(e) => setCreateData('color', e.target.value)}
                                        className="w-full h-9 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Pilihan Ikon
                                </label>
                                <select
                                    value={createData.icon}
                                    onChange={(e) => setCreateData('icon', e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                >
                                    <option value="Calculator">Calculator (Matematika / Hitung)</option>
                                    <option value="BookOpen">BookOpen (Bahasa / Teori)</option>
                                    <option value="Languages">Languages (Bahasa Asing)</option>
                                    <option value="Code">Code (Komputer / TI)</option>
                                    <option value="Scale">Scale (Hukum / PPKN)</option>
                                    <option value="Palette">Palette (Seni / Desain)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Deskripsi (Opsional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={createData.description}
                                    onChange={(e) => setCreateData('description', e.target.value)}
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
                                    disabled={createProcessing}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-[#0D827C] hover:bg-[#064E4B] rounded-xl shadow-xs disabled:opacity-50"
                                >
                                    {createProcessing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit */}
            {editingSubject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setEditingSubject(null)} />
                    <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Edit Mata Pelajaran</h3>
                            <button onClick={() => setEditingSubject(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitEdit} className="mt-4 space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Nama Mata Pelajaran
                                </label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData('name', e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Kode Singkat
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.code}
                                        onChange={(e) => setEditData('code', e.target.value)}
                                        className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Warna
                                    </label>
                                    <input
                                        type="color"
                                        value={editData.color}
                                        onChange={(e) => setEditData('color', e.target.value)}
                                        className="w-full h-9 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Pilihan Ikon
                                </label>
                                <select
                                    value={editData.icon}
                                    onChange={(e) => setEditData('icon', e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                >
                                    <option value="Calculator">Calculator</option>
                                    <option value="BookOpen">BookOpen</option>
                                    <option value="Languages">Languages</option>
                                    <option value="Code">Code</option>
                                    <option value="Scale">Scale</option>
                                    <option value="Palette">Palette</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingSubject(null)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-[#0D827C] hover:bg-[#064E4B] rounded-xl shadow-xs disabled:opacity-50"
                                >
                                    {editProcessing ? 'Menyimpan...' : 'Perbarui'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

