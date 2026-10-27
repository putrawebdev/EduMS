import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    GraduationCap,
    Users,
    BookOpen,
    ClipboardList,
    Calendar,
    Bell,
    Plus,
    FileText,
    ArrowLeft,
    Download,
    CheckCircle,
    UserMinus,
    Clock,
    X,
    Search,
} from 'lucide-react';

interface ClassroomShowProps {
    classroom: {
        id: number;
        name: string;
        code: string;
        description: string | null;
        academic_year: string;
        semester: string;
        teacher: { id: number; name: string } | null;
        students: Array<{ id: number; name: string; email: string; nip_nisn: string | null }>;
        subjects: Array<{ id: number; name: string; color: string; icon: string }>;
        schedules: Array<{
            id: number;
            day_of_week: number;
            day_name: string;
            start_time: string;
            end_time: string;
            room: string | null;
            subject: { name: string; color: string };
            teacher: { name: string };
        }>;
        learning_materials: Array<{
            id: number;
            title: string;
            description: string | null;
            file_path: string | null;
            file_name: string | null;
            subject: { name: string; color: string };
            teacher: { name: string };
            published_at: string;
        }>;
        assignments: Array<{
            id: number;
            title: string;
            instructions: string;
            due_date: string;
            max_score: number;
            subject: { name: string; color: string };
            teacher: { name: string };
        }>;
        announcements: Array<{
            id: number;
            title: string;
            content: string;
            author: { name: string };
            created_at: string;
        }>;
    };
    availableStudents: Array<{ id: number; name: string; email: string }>;
    availableSubjects: Array<{ id: number; name: string }>;
}

export default function ClassroomShow({
    classroom,
    availableStudents,
    availableSubjects,
}: ClassroomShowProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const canManage = user.role === 'admin' || (user.role === 'guru' && classroom.teacher?.id === user.id);

    const [activeTab, setActiveTab] = useState<'materi' | 'tugas' | 'jadwal' | 'siswa' | 'pengumuman'>('materi');
    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
    const [materialSearch, setMaterialSearch] = useState('');
    const [materialSubject, setMaterialSubject] = useState('');
    const [assignmentSearch, setAssignmentSearch] = useState('');
    const [assignmentSubject, setAssignmentSubject] = useState('');

    const normalizedMaterialSearch = materialSearch.trim().toLocaleLowerCase();
    const filteredMaterials = classroom.learning_materials.filter((material) => {
        const matchesSearch = [
            material.title,
            material.description || '',
            material.subject?.name || '',
            material.teacher?.name || '',
        ].some((value) => value.toLocaleLowerCase().includes(normalizedMaterialSearch));
        return matchesSearch && (!materialSubject || material.subject?.name === materialSubject);
    });

    const normalizedAssignmentSearch = assignmentSearch.trim().toLocaleLowerCase();
    const filteredAssignments = classroom.assignments.filter((assignment) => {
        const matchesSearch = [
            assignment.title,
            assignment.instructions,
            assignment.subject?.name || '',
            assignment.teacher?.name || '',
        ].some((value) => value.toLocaleLowerCase().includes(normalizedAssignmentSearch));
        return matchesSearch && (!assignmentSubject || assignment.subject?.name === assignmentSubject);
    });

    const { data: addData, setData: setAddData, post: postAdd, processing: addProcessing, reset: resetAdd } = useForm({
        user_id: '',
    });

    const submitAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        postAdd(route('classes.members.add', classroom.id), {
            onSuccess: () => {
                setIsAddStudentOpen(false);
                resetAdd();
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${classroom.name} - EduSpace LMS`} />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Back button & Class Header Card */}
                <div>
                    <Link
                        href={route('classes.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Daftar Kelas</span>
                    </Link>

                    <div className="bg-gradient-to-r from-[#064E4B] to-[#0D827C] text-white rounded-3xl p-6 sm:p-8 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="inline-block px-3 py-1 bg-white/20 text-white font-bold text-xs rounded-full mb-2">
                                    {classroom.code}
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                    {classroom.name}
                                </h2>
                                <p className="text-sm text-teal-100/90 mt-1 max-w-xl">
                                    {classroom.description || 'Peminatan Ilmu Pengetahuan dan Pengembangan Karakter Mandiri'}
                                </p>
                            </div>

                            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-xs space-y-1.5 min-w-[200px]">
                                <p>
                                    <span className="text-teal-200">Wali Kelas:</span>{' '}
                                    <span className="font-bold">{classroom.teacher?.name || '-'}</span>
                                </p>
                                <p>
                                    <span className="text-teal-200">Semester:</span>{' '}
                                    <span className="font-bold">{classroom.semester} ({classroom.academic_year})</span>
                                </p>
                                <p>
                                    <span className="text-teal-200">Total Anggota:</span>{' '}
                                    <span className="font-bold">{classroom.students.length} Siswa</span>
                                </p>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="mt-8 pt-4 border-t border-white/15 flex items-center gap-2 overflow-x-auto scrollbar-none">
                            {[
                                { key: 'materi', label: `Materi (${classroom.learning_materials.length})`, icon: BookOpen },
                                { key: 'tugas', label: `Tugas (${classroom.assignments.length})`, icon: ClipboardList },
                                { key: 'jadwal', label: `Jadwal (${classroom.schedules.length})`, icon: Calendar },
                                { key: 'siswa', label: `Siswa (${classroom.students.length})`, icon: Users },
                                { key: 'pengumuman', label: `Pengumuman (${classroom.announcements.length})`, icon: Bell },
                            ].map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key as any)}
                                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                                            activeTab === tab.key
                                                ? 'bg-white text-[#064E4B] shadow-sm'
                                                : 'text-teal-100/80 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* TAB CONTENT */}
                {/* 1. MATERI */}
                {activeTab === 'materi' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 text-lg">Materi Pembelajaran</h3>
                            {canManage && (
                                <Link
                                    href={route('materials.index')}
                                    className="px-4 py-2 bg-[#0D827C] text-white text-xs font-semibold rounded-xl hover:bg-[#064E4B] flex items-center gap-1.5 transition"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Unggah Materi</span>
                                </Link>
                            )}
                        </div>

                        {classroom.learning_materials.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_220px] gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="search"
                                        value={materialSearch}
                                        onChange={(e) => setMaterialSearch(e.target.value)}
                                        placeholder="Cari judul, deskripsi, atau guru..."
                                        aria-label="Cari materi pembelajaran"
                                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-hidden focus:border-[#0D827C]"
                                    />
                                </div>
                                <select
                                    value={materialSubject}
                                    onChange={(e) => setMaterialSubject(e.target.value)}
                                    aria-label="Filter materi berdasarkan mata pelajaran"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-hidden focus:border-[#0D827C]"
                                >
                                    <option value="">Semua Mata Pelajaran</option>
                                    {classroom.subjects.map((subject) => (
                                        <option key={subject.id} value={subject.name}>{subject.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {classroom.learning_materials.length === 0 ? (
                            <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-xs">
                                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-500 font-medium">Belum ada materi pembelajaran yang diunggah untuk kelas ini.</p>
                            </div>
                        ) : filteredMaterials.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs">
                                <p className="text-sm text-slate-500">Tidak ada materi yang cocok dengan pencarian atau filter.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredMaterials.map((mat) => (
                                    <div key={mat.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className="px-2.5 py-1 text-xs font-bold rounded-lg text-white"
                                                    style={{ backgroundColor: mat.subject?.color || '#0D827C' }}
                                                >
                                                    {mat.subject?.name}
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    {mat.teacher?.name}
                                                </span>
                                            </div>
                                            <h4 className="text-base font-bold text-slate-800 mt-2.5">
                                                {mat.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                {mat.description || 'Pelajari materi ini dengan cermat untuk memahami konsep secara komprehensif.'}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                                            <Link
                                                href={route('materials.show', mat.id)}
                                                className="text-xs font-semibold text-[#0D827C] hover:underline"
                                            >
                                                Lihat Rincian Materi →
                                            </Link>
                                            {mat.file_path && (
                                                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                                    <Download className="w-3.5 h-3.5" /> Ada File
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 2. TUGAS */}
                {activeTab === 'tugas' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 text-lg">Tugas & Evaluasi</h3>
                            {canManage && (
                                <Link
                                    href={route('assignments.index')}
                                    className="px-4 py-2 bg-[#0D827C] text-white text-xs font-semibold rounded-xl hover:bg-[#064E4B] flex items-center gap-1.5 transition"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Buat Tugas</span>
                                </Link>
                            )}
                        </div>

                        {classroom.assignments.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_220px] gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="search"
                                        value={assignmentSearch}
                                        onChange={(e) => setAssignmentSearch(e.target.value)}
                                        placeholder="Cari judul, instruksi, atau guru..."
                                        aria-label="Cari tugas"
                                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-hidden focus:border-[#0D827C]"
                                    />
                                </div>
                                <select
                                    value={assignmentSubject}
                                    onChange={(e) => setAssignmentSubject(e.target.value)}
                                    aria-label="Filter tugas berdasarkan mata pelajaran"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-hidden focus:border-[#0D827C]"
                                >
                                    <option value="">Semua Mata Pelajaran</option>
                                    {classroom.subjects.map((subject) => (
                                        <option key={subject.id} value={subject.name}>{subject.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {classroom.assignments.length === 0 ? (
                            <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-xs">
                                <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-500 font-medium">Belum ada tugas aktif untuk kelas ini.</p>
                            </div>
                        ) : filteredAssignments.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs">
                                <p className="text-sm text-slate-500">Tidak ada tugas yang cocok dengan pencarian atau filter.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredAssignments.map((a) => (
                                    <div key={a.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className="px-2.5 py-1 text-xs font-bold rounded-lg text-white"
                                                    style={{ backgroundColor: a.subject?.color || '#0D827C' }}
                                                >
                                                    {a.subject?.name}
                                                </span>
                                                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    Tenggat: {new Date(a.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} WIB
                                                </span>
                                            </div>
                                            <h4 className="text-base font-bold text-slate-800 mt-2.5">
                                                {a.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                {a.instructions}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-400">
                                                Nilai Maks: {a.max_score}
                                            </span>
                                            <Link
                                                href={route('assignments.show', a.id)}
                                                className="px-3.5 py-1.5 bg-[#0D827C] text-white text-xs font-semibold rounded-xl hover:bg-[#064E4B] transition"
                                            >
                                                Buka Tugas
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. JADWAL */}
                {activeTab === 'jadwal' && (
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                        <h3 className="font-bold text-slate-800 text-lg">Jadwal Pelajaran Mingguan</h3>
                        {classroom.schedules.length === 0 ? (
                            <p className="text-sm text-slate-400 py-6 text-center">Belum ada jadwal yang diatur.</p>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {classroom.schedules.map((sch) => (
                                    <div key={sch.id} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D827C] font-bold text-xs flex items-center justify-center">
                                                {sch.day_name.substring(0, 3)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{sch.subject?.name}</p>
                                                <p className="text-xs text-slate-500">Guru: {sch.teacher?.name} • Ruangan: {sch.room || 'Kelas'}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                                            {sch.start_time.substring(0, 5)} - {sch.end_time.substring(0, 5)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 4. SISWA */}
                {activeTab === 'siswa' && (
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 text-lg">
                                Anggota Siswa ({classroom.students.length})
                            </h3>
                            {canManage && (
                                <button
                                    onClick={() => setIsAddStudentOpen(true)}
                                    className="px-4 py-2 bg-[#0D827C] text-white text-xs font-semibold rounded-xl hover:bg-[#064E4B] flex items-center gap-1.5 transition"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Siswa</span>
                                </button>
                            )}
                        </div>

                        {classroom.students.length === 0 ? (
                            <p className="text-sm text-slate-400 py-6 text-center">Belum ada siswa yang bergabung di kelas ini.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {classroom.students.map((student) => (
                                    <div
                                        key={student.id}
                                        className="p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-full bg-teal-100 text-[#0D827C] font-bold text-xs flex items-center justify-center shrink-0">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{student.name}</p>
                                                <p className="text-xs text-slate-400 truncate">NISN: {student.nip_nisn || '-'}</p>
                                            </div>
                                        </div>

                                        {canManage && (
                                            <Link
                                                href={route('classes.members.remove', [classroom.id, student.id])}
                                                method="delete"
                                                as="button"
                                                title="Keluarkan dari kelas"
                                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 5. PENGUMUMAN */}
                {activeTab === 'pengumuman' && (
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                        <h3 className="font-bold text-slate-800 text-lg">Pengumuman Kelas</h3>
                        {classroom.announcements.length === 0 ? (
                            <p className="text-sm text-slate-400 py-6 text-center">Belum ada pengumuman khusus untuk kelas ini.</p>
                        ) : (
                            <div className="divide-y divide-slate-100 space-y-4">
                                {classroom.announcements.map((ann) => (
                                    <div key={ann.id} className="pt-4 first:pt-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-base text-slate-800">{ann.title}</h4>
                                            <span className="text-xs text-slate-400">
                                                {new Date(ann.created_at).toLocaleDateString('id-ID')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5">Oleh: {ann.author?.name}</p>
                                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{ann.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Add Student */}
            {isAddStudentOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsAddStudentOpen(false)} />
                    <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Tambah Anggota Siswa</h3>
                            <button onClick={() => setIsAddStudentOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitAddMember} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Pilih Siswa
                                </label>
                                <select
                                    value={addData.user_id}
                                    onChange={(e) => setAddData('user_id', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                >
                                    <option value="">Pilih Siswa yang Belum Terdaftar</option>
                                    {availableStudents.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddStudentOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={addProcessing}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-[#0D827C] hover:bg-[#064E4B] rounded-xl shadow-xs disabled:opacity-50"
                                >
                                    {addProcessing ? 'Menambahkan...' : 'Tambahkan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
