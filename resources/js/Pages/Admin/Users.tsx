import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Users,
    Plus,
    Search,
    Edit3,
    Trash2,
    CheckCircle,
    XCircle,
    X,
} from 'lucide-react';

interface AdminUsersProps {
    users: {
        data: Array<{
            id: number;
            name: string;
            email: string;
            role: string;
            subjects: Array<{ id: number; name: string }>;
            nip_nisn: string | null;
            phone: string | null;
            grade_level: string | null;
            is_active: boolean;
        }>;
        links: Array<any>;
    };
    subjects: Array<{ id: number; name: string }>;
    filters: { role?: string; search?: string };
}

export default function AdminUsers({ users, subjects, filters }: AdminUsersProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any | null>(null);

    // Create form
    const { data: createData, setData: setCreateData, post: postCreate, processing: createProcessing, errors: createErrors, reset: resetCreate } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'siswa',
        subject_ids: [] as string[],
        nip_nisn: '',
        phone: '',
        grade_level: 'Kelas 10',
    });

    // Edit form
    const { data: editData, setData: setEditData, put: putEdit, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'siswa',
        subject_ids: [] as string[],
        nip_nisn: '',
        phone: '',
        grade_level: '',
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        postCreate(route('admin.users.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreate();
            },
        });
    };

    const openEdit = (u: any) => {
        setEditingUser(u);
        setEditData({
            name: u.name,
            email: u.email,
            password: '',
            role: u.role,
            subject_ids: u.subjects?.map((subject: { id: number }) => subject.id.toString()) || [],
            nip_nisn: u.nip_nisn || '',
            phone: u.phone || '',
            grade_level: u.grade_level || '',
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        putEdit(route('admin.users.update', editingUser.id), {
            onSuccess: () => {
                setEditingUser(null);
                resetEdit();
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Kelola Pengguna - EduSpace LMS" />

            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                            Manajemen Pengguna
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            Kelola data akun siswa, guru, dan staf administrator sekolah.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="px-4 py-2.5 bg-[#0D827C] hover:bg-[#064E4B] text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2 self-start sm:self-center"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Pengguna</span>
                    </button>
                </div>

                {/* Filter Roles */}
                <div className="flex flex-wrap items-center gap-2">
                    {[
                        { label: 'Semua Pengguna', val: '' },
                        { label: 'Siswa', val: 'siswa' },
                        { label: 'Guru', val: 'guru' },
                        { label: 'Administrator', val: 'admin' },
                    ].map((f) => (
                        <Link
                            key={f.val}
                            href={route('admin.users.index', f.val ? { role: f.val } : {})}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                                (filters.role || '') === f.val
                                    ? 'bg-[#0D827C] text-white'
                                    : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                        >
                            {f.label}
                        </Link>
                    ))}
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-400 font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="py-3 px-4">Nama Lengkap</th>
                                    <th className="py-3 px-4">Email</th>
                                    <th className="py-3 px-4">Role</th>
                                    <th className="py-3 px-4">NIP / NISN</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.data.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/70">
                                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                                            {u.name}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 text-xs">
                                            {u.email}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${
                                                u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                u.role === 'guru' ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {u.role}
                                            </span>
                                            {u.role === 'guru' && u.subjects?.length > 0 && (
                                                <p className="mt-1 text-[11px] text-slate-500">
                                                    {u.subjects.map((subject) => subject.name).join(', ')}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                                            {u.nip_nisn || '-'}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                                u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                                            }`}>
                                                {u.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(u)}
                                                    className="p-1.5 text-slate-400 hover:text-teal-700 rounded-lg hover:bg-slate-100"
                                                    title="Edit Pengguna"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    href={route('admin.users.toggle-active', u.id)}
                                                    method="post"
                                                    as="button"
                                                    className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100"
                                                    title={u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                >
                                                    {u.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                </Link>
                                                <Link
                                                    href={route('admin.users.destroy', u.id)}
                                                    method="delete"
                                                    as="button"
                                                    onClick={(e) => {
                                                        if (!confirm(`Hapus pengguna ${u.name}?`)) e.preventDefault();
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                                                    title="Hapus Pengguna"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Create */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsCreateOpen(false)} />
                    <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Tambah Pengguna Baru</h3>
                            <button onClick={() => setIsCreateOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitCreate} className="mt-4 space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    value={createData.name}
                                    onChange={(e) => setCreateData('name', e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                />
                                {createErrors.name && <p className="text-xs text-rose-500 mt-1">{createErrors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={createData.email}
                                    onChange={(e) => setCreateData('email', e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                />
                                {createErrors.email && <p className="text-xs text-rose-500 mt-1">{createErrors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={createData.password}
                                    onChange={(e) => setCreateData('password', e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                />
                                {createErrors.password && <p className="text-xs text-rose-500 mt-1">{createErrors.password}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Peran (Role)
                                    </label>
                                    <select
                                        value={createData.role}
                                        onChange={(e) => setCreateData('role', e.target.value)}
                                        className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    >
                                        <option value="siswa">Siswa</option>
                                        <option value="guru">Guru</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        NIP / NISN
                                    </label>
                                    <input
                                        type="text"
                                        value={createData.nip_nisn}
                                        onChange={(e) => setCreateData('nip_nisn', e.target.value)}
                                        className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    />
                                </div>
                            </div>

                            {createData.role === 'guru' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Mata Pelajaran (maksimal 2)
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        {subjects.map((subject) => {
                                            const checked = createData.subject_ids.includes(subject.id.toString());
                                            return (
                                                <label key={subject.id} className="flex items-center gap-2 text-sm text-slate-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        disabled={!checked && createData.subject_ids.length >= 2}
                                                        onChange={(e) => setCreateData(
                                                            'subject_ids',
                                                            e.target.checked
                                                                ? [...createData.subject_ids, subject.id.toString()]
                                                                : createData.subject_ids.filter((id) => id !== subject.id.toString()),
                                                        )}
                                                        className="rounded border-slate-300 text-[#0D827C] focus:ring-[#0D827C]"
                                                    />
                                                    {subject.name}
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {createErrors.subject_ids && <p className="text-xs text-rose-500 mt-1">{createErrors.subject_ids}</p>}
                                </div>
                            )}

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
                                    {createProcessing ? 'Menyimpan...' : 'Simpan Pengguna'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setEditingUser(null)} />
                    <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Edit Pengguna</h3>
                            <button onClick={() => setEditingUser(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitEdit} className="mt-4 space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData('name', e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={editData.email}
                                    onChange={(e) => setEditData('email', e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Password Baru (Kosongkan jika tidak diubah)
                                </label>
                                <input
                                    type="password"
                                    value={editData.password}
                                    onChange={(e) => setEditData('password', e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Peran (Role)
                                    </label>
                                    <select
                                        value={editData.role}
                                        onChange={(e) => setEditData('role', e.target.value)}
                                        className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    >
                                        <option value="siswa">Siswa</option>
                                        <option value="guru">Guru</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        NIP / NISN
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.nip_nisn}
                                        onChange={(e) => setEditData('nip_nisn', e.target.value)}
                                        className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    />
                                </div>
                            </div>

                            {editData.role === 'guru' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Mata Pelajaran (maksimal 2)
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        {subjects.map((subject) => {
                                            const checked = editData.subject_ids.includes(subject.id.toString());
                                            return (
                                                <label key={subject.id} className="flex items-center gap-2 text-sm text-slate-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        disabled={!checked && editData.subject_ids.length >= 2}
                                                        onChange={(e) => setEditData(
                                                            'subject_ids',
                                                            e.target.checked
                                                                ? [...editData.subject_ids, subject.id.toString()]
                                                                : editData.subject_ids.filter((id) => id !== subject.id.toString()),
                                                        )}
                                                        className="rounded border-slate-300 text-[#0D827C] focus:ring-[#0D827C]"
                                                    />
                                                    {subject.name}
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {editErrors.subject_ids && <p className="text-xs text-rose-500 mt-1">{editErrors.subject_ids}</p>}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-[#0D827C] hover:bg-[#064E4B] rounded-xl shadow-xs disabled:opacity-50"
                                >
                                    {editProcessing ? 'Menyimpan...' : 'Perbarui Pengguna'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
