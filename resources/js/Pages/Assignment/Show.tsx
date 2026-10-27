import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    ArrowLeft,
    Clock,
    Download,
    FileText,
    CheckCircle,
    AlertTriangle,
    Upload,
    Calendar,
    Award,
    Edit3,
    User as UserIcon,
    X,
    Send,
} from 'lucide-react';

interface AssignmentShowProps {
    assignment: {
        id: number;
        title: string;
        instructions: string;
        attachment_path: string | null;
        attachment_name: string | null;
        due_date: string;
        max_score: number;
        allow_late_submission: boolean;
        late_penalty_percent: number;
        classroom: { id: number; name: string };
        subject: { id: number; name: string; color: string };
        teacher: { id: number; name: string };
    };
    mySubmission: {
        id: number;
        status: string;
        submission_text: string | null;
        file_path: string | null;
        file_name: string | null;
        submitted_at: string;
        is_late: boolean;
        score: number | null;
        teacher_feedback: string | null;
        attempt_number: number;
    } | null;
    allSubmissions: Array<{
        id: number;
        status: string;
        submission_text: string | null;
        file_path: string | null;
        file_name: string | null;
        submitted_at: string;
        is_late: boolean;
        score: number | null;
        teacher_feedback: string | null;
        student: { id: number; name: string; nip_nisn: string | null };
    }>;
    isOverdue: boolean;
}

export default function AssignmentShow({
    assignment,
    mySubmission,
    allSubmissions,
    isOverdue,
}: AssignmentShowProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const isTeacherOrAdmin = user.role === 'admin' || user.role === 'guru';

    // Extend deadline modal state
    const [isExtendOpen, setIsExtendOpen] = useState(false);
    const { data: extendData, setData: setExtendData, post: postExtend, processing: extendProcessing } = useForm({
        due_date: '',
        reason: '',
    });

    const submitExtend = (e: React.FormEvent) => {
        e.preventDefault();
        postExtend(route('assignments.extend-deadline', assignment.id), {
            onSuccess: () => setIsExtendOpen(false),
        });
    };

    // Student submission form
    const { data: submitData, setData: setSubmitData, post: postSubmit, processing: submitProcessing } = useForm({
        submission_text: mySubmission?.submission_text || '',
        file: null as File | null,
    });

    const handleStudentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postSubmit(route('submissions.store', assignment.id));
    };

    // Grading modal state
    const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
    const { data: gradeData, setData: setGradeData, post: postGrade, processing: gradeProcessing } = useForm({
        score: '',
        teacher_feedback: '',
    });

    const openGradeModal = (sub: any) => {
        setGradingSubmission(sub);
        setGradeData({
            score: sub.score ? sub.score.toString() : '',
            teacher_feedback: sub.teacher_feedback || '',
        });
    };

    const handleGradeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!gradingSubmission) return;
        postGrade(route('submissions.grade', gradingSubmission.id), {
            onSuccess: () => setGradingSubmission(null),
        });
    };

    const dueDateObj = new Date(assignment.due_date);

    return (
        <AuthenticatedLayout>
            <Head title={`${assignment.title} - EduSpace LMS`} />

            <div className="space-y-6 max-w-5xl mx-auto">
                <Link
                    href={route('assignments.index')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Daftar Tugas</span>
                </Link>

                {/* Assignment Detail Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <span
                                className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
                                style={{ backgroundColor: assignment.subject?.color || '#0D827C' }}
                            >
                                {assignment.subject?.name}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                {assignment.classroom?.name}
                            </span>
                        </div>

                        {isTeacherOrAdmin && (
                            <button
                                onClick={() => setIsExtendOpen(true)}
                                className="px-3.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-semibold border border-amber-200 transition flex items-center gap-1.5 self-start sm:self-center"
                            >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Perpanjang Tenggat</span>
                            </button>
                        )}
                    </div>

                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                            {assignment.title}
                        </h2>
                        <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                                <Clock className="w-4 h-4 text-[#0D827C]" />
                                Tenggat: {dueDateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-amber-500" />
                                Nilai Maks: {assignment.max_score}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                <UserIcon className="w-4 h-4" />
                                Guru: {assignment.teacher?.name}
                            </span>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Instruksi Pengerjaan
                        </h4>
                        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line border border-slate-100">
                            {assignment.instructions}
                        </div>
                    </div>

                    {/* Attachment if any */}
                    {assignment.attachment_path && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Lembar Soal / Lampiran Guru
                            </h4>
                            <div className="flex items-center justify-between p-3.5 bg-teal-50/50 border border-teal-100 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-[#0D827C]" />
                                    <span className="text-xs sm:text-sm font-semibold text-slate-800">
                                        {assignment.attachment_name || 'Lampiran Tugas'}
                                    </span>
                                </div>
                                <a
                                    href={`/storage/${assignment.attachment_path}`}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3.5 py-1.5 bg-[#0D827C] text-white text-xs font-semibold rounded-xl hover:bg-[#064E4B] transition flex items-center gap-1"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Unduh</span>
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* STUDENT SECTION: SUBMISSION FORM & RESULTS */}
                {user.role === 'siswa' && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 className="font-bold text-lg text-slate-800">
                                Status Pengumpulan Tugas Anda
                            </h3>
                            {mySubmission ? (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                    mySubmission.status === 'graded'
                                        ? 'bg-teal-50 text-[#0D827C] border-teal-200'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}>
                                    {mySubmission.status === 'graded' ? 'Sudah Dinilai' : 'Sudah Dikumpulkan'}
                                </span>
                            ) : isOverdue ? (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                    Terlambat Belum Dikumpulkan
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    Belum Dikumpulkan
                                </span>
                            )}
                        </div>

                        {/* If already graded, show grade banner */}
                        {mySubmission && mySubmission.status === 'graded' && (
                            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                                        Hasil Evaluasi Guru
                                    </span>
                                    <span className="text-2xl font-extrabold text-[#0D827C]">
                                        {mySubmission.score} <span className="text-sm font-normal text-slate-500">/ {assignment.max_score}</span>
                                    </span>
                                </div>
                                {mySubmission.teacher_feedback && (
                                    <p className="text-sm text-slate-700 bg-white/70 p-3 rounded-xl border border-teal-100 mt-2">
                                        <span className="font-semibold text-slate-800">Catatan Guru: </span>
                                        {mySubmission.teacher_feedback}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Submission Details if submitted */}
                        {mySubmission && (
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Dikumpulkan pada: {new Date(mySubmission.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</span>
                                    {mySubmission.is_late && (
                                        <span className="text-rose-600 font-bold">Terlambat</span>
                                    )}
                                </div>
                                {mySubmission.submission_text && (
                                    <div className="mt-2 text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                                        {mySubmission.submission_text}
                                    </div>
                                )}
                                {mySubmission.file_path && (
                                    <div className="mt-2 flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100">
                                        <span className="text-xs font-medium text-slate-700 truncate">
                                            {mySubmission.file_name}
                                        </span>
                                        <a
                                            href={`/storage/${mySubmission.file_path}`}
                                            download
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-[#0D827C] font-semibold hover:underline flex items-center gap-1"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Unduh File Jawaban
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Submission Form (New or Re-submission) */}
                        <form onSubmit={handleStudentSubmit} className="space-y-4 pt-2">
                            <h4 className="text-sm font-bold text-slate-800">
                                {mySubmission ? 'Kirim Pembaruan Jawaban (Kumpul Ulang)' : 'Kumpulkan Jawaban Tugas'}
                            </h4>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Teks Jawaban / Keterangan Singkat
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Tuliskan jawaban langsung atau tautan repositori..."
                                    value={submitData.submission_text}
                                    onChange={(e) => setSubmitData('submission_text', e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Unggah File Jawaban (PDF, DOCX, ZIP, Gambar - Maks 50MB)
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setSubmitData('file', e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#0D827C] hover:file:bg-teal-100"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitProcessing}
                                className="px-6 py-2.5 bg-[#0D827C] hover:bg-[#064E4B] text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                                <span>{submitProcessing ? 'Mengirim...' : mySubmission ? 'Kirim Ulang Jawaban' : 'Kumpulkan Sekarang'}</span>
                            </button>
                        </form>
                    </div>
                )}

                {/* TEACHER / ADMIN SECTION: SUBMISSION LIST & GRADING */}
                {isTeacherOrAdmin && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">
                                    Daftar Pengumpulan Siswa ({allSubmissions.length})
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Periksa hasil tugas siswa dan masukkan nilai evaluasi.
                                </p>
                            </div>
                        </div>

                        {allSubmissions.length === 0 ? (
                            <p className="text-sm text-slate-400 py-8 text-center">Belum ada siswa yang mengumpulkan tugas ini.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-xs text-slate-400 font-semibold border-b border-slate-100">
                                        <tr>
                                            <th className="py-3 px-4">Nama Siswa</th>
                                            <th className="py-3 px-4">Waktu Kumpul</th>
                                            <th className="py-3 px-4">File / Teks</th>
                                            <th className="py-3 px-4">Nilai</th>
                                            <th className="py-3 px-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {allSubmissions.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-slate-50/70">
                                                <td className="py-3.5 px-4 font-semibold text-slate-800">
                                                    <div>
                                                        <p>{sub.student?.name}</p>
                                                        <p className="text-[11px] text-slate-400 font-normal">NISN: {sub.student?.nip_nisn || '-'}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                                                    <p>{new Date(sub.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                    {sub.is_late && <span className="text-[10px] text-rose-500 font-bold">Terlambat</span>}
                                                </td>
                                                <td className="py-3.5 px-4 text-xs">
                                                    {sub.file_path ? (
                                                        <a
                                                            href={`/storage/${sub.file_path}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            download
                                                            className="text-[#0D827C] font-semibold hover:underline flex items-center gap-1"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                            <span className="truncate max-w-[120px]">{sub.file_name}</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-600 line-clamp-1">{sub.submission_text || 'Hanya Teks'}</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {sub.status === 'graded' ? (
                                                        <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                                                            {sub.score} / {assignment.max_score}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 font-medium">Belum dinilai</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <button
                                                        onClick={() => openGradeModal(sub)}
                                                        className="px-3 py-1.5 bg-[#0D827C] hover:bg-[#064E4B] text-white text-xs font-semibold rounded-xl transition"
                                                    >
                                                        {sub.status === 'graded' ? 'Ubah Nilai' : 'Beri Nilai'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Extend Deadline */}
            {isExtendOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsExtendOpen(false)} />
                    <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Perpanjang Batas Waktu</h3>
                            <button onClick={() => setIsExtendOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitExtend} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Tenggat Baru
                                </label>
                                <input
                                    type="datetime-local"
                                    value={extendData.due_date}
                                    onChange={(e) => setExtendData('due_date', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Alasan Perpanjangan (Opsional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Kesempatan tambahan bagi yang terkendala teknis"
                                    value={extendData.reason}
                                    onChange={(e) => setExtendData('reason', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsExtendOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={extendProcessing}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-[#0D827C] hover:bg-[#064E4B] rounded-xl shadow-xs disabled:opacity-50"
                                >
                                    {extendProcessing ? 'Memperbarui...' : 'Simpan & Beritahu Siswa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Grade Submission */}
            {gradingSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setGradingSubmission(null)} />
                    <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Evaluasi & Penilaian</h3>
                                <p className="text-xs text-slate-500">{gradingSubmission.student?.name}</p>
                            </div>
                            <button onClick={() => setGradingSubmission(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleGradeSubmit} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Nilai Angka (0 - {assignment.max_score})
                                </label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max={assignment.max_score}
                                    placeholder="Contoh: 90"
                                    value={gradeData.score}
                                    onChange={(e) => setGradeData('score', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Catatan / Feedback Guru (Opsional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Tuliskan masukan untuk peningkatan kualitas belajar siswa..."
                                    value={gradeData.teacher_feedback}
                                    onChange={(e) => setGradeData('teacher_feedback', e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setGradingSubmission(null)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={gradeProcessing}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-[#0D827C] hover:bg-[#064E4B] rounded-xl shadow-xs disabled:opacity-50"
                                >
                                    {gradeProcessing ? 'Menyimpan...' : 'Kirim Nilai'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

