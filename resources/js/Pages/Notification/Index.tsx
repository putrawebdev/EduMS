import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    Bell,
    Check,
    CheckCheck,
    Settings,
    FileText,
    Send,
    Radio,
    ShieldCheck,
    AlertCircle,
    Info,
} from 'lucide-react';
import axios from 'axios';

interface NotificationIndexProps {
    notifications: {
        data: Array<{
            id: number;
            type: string;
            title: string;
            message: string;
            url: string | null;
            is_read: boolean;
            created_at: string;
        }>;
        links: Array<any>;
    };
    preferences: {
        new_assignment: boolean;
        due_soon: boolean;
        deadline_arrived: boolean;
        deadline_extended: boolean;
        submission_received: boolean;
        assignment_graded: boolean;
        new_announcement: boolean;
        overdue_reminder: boolean;
        web_push: boolean;
    };
    hasPushSubscription: boolean;
}

export default function NotificationIndex({
    notifications,
    preferences,
    hasPushSubscription,
}: NotificationIndexProps) {
    const { auth, vapid_public_key } = usePage<PageProps>().props;
    const user = auth.user;

    const [activeTab, setActiveTab] = useState<'semua' | 'preferensi'>('semua');
    const [browserSupported, setBrowserSupported] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<string>('default');
    const [isTestingPush, setIsTestingPush] = useState(false);
    const [testResultMessage, setTestResultMessage] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
            setBrowserSupported(true);
            setPermissionStatus(Notification.permission);
        }
    }, []);

    // Preferences form
    const { data: prefData, setData: setPrefData, post: postPref, processing: prefProcessing } = useForm({
        new_assignment: preferences.new_assignment,
        due_soon: preferences.due_soon,
        deadline_arrived: preferences.deadline_arrived,
        deadline_extended: preferences.deadline_extended,
        submission_received: preferences.submission_received,
        assignment_graded: preferences.assignment_graded,
        new_announcement: preferences.new_announcement,
        overdue_reminder: preferences.overdue_reminder,
        web_push: preferences.web_push,
    });

    const submitPreferences = (e: React.FormEvent) => {
        e.preventDefault();
        postPref(route('notifications.preferences.update'));
    };

    const handleTestPush = async () => {
        setIsTestingPush(true);
        setTestResultMessage(null);
        try {
            const res = await axios.post(route('api.push-test'));
            setTestResultMessage('Uji coba berhasil dikirim! Periksa notifikasi sistem di pojok layar Anda.');
        } catch (err: any) {
            setTestResultMessage('Gagal mengirim uji coba notifikasi: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsTestingPush(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pusat Notifikasi - EduSpace LMS" />

            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                            Pusat Notifikasi & Push
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            Kelola pemberitahuan tugas, materi, dan preferensi Web Push otomatis.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('notifications.mark-all-read')}
                            method="post"
                            as="button"
                            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                        >
                            <CheckCheck className="w-4 h-4 text-teal-600" />
                            <span>Tandai Semua Dibaca</span>
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                    <button
                        onClick={() => setActiveTab('semua')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                            activeTab === 'semua'
                                ? 'bg-[#0D827C] text-white shadow-xs'
                                : 'text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                        <Bell className="w-4 h-4" />
                        <span>Daftar Notifikasi</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('preferensi')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                            activeTab === 'preferensi'
                                ? 'bg-[#0D827C] text-white shadow-xs'
                                : 'text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                        <Settings className="w-4 h-4" />
                        <span>Pengaturan & Web Push VAPID</span>
                    </button>
                </div>

                {/* TAB 1: NOTIFICATION LIST */}
                {activeTab === 'semua' && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
                        {notifications.data.length === 0 ? (
                            <div className="p-12 text-center">
                                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="font-bold text-slate-700 text-base">Tidak Ada Notifikasi</h3>
                                <p className="text-sm text-slate-400 mt-1">Semua pemberitahuan telah dibaca atau belum ada aktivitas baru.</p>
                            </div>
                        ) : (
                            notifications.data.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/80 transition ${
                                        !n.is_read ? 'bg-teal-50/20' : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-3.5 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0D827C] flex items-center justify-center shrink-0 mt-0.5">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-sm sm:text-base text-slate-800">
                                                    {n.title}
                                                </h4>
                                                {!n.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                                                {n.message}
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-1.5">
                                                {new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {n.url && (
                                            <Link
                                                href={n.url}
                                                className="px-3 py-1.5 bg-[#0D827C] hover:bg-[#064E4B] text-white text-xs font-semibold rounded-xl transition"
                                            >
                                                Buka
                                            </Link>
                                        )}
                                        {!n.is_read && (
                                            <Link
                                                href={route('notifications.mark-as-read', n.id)}
                                                method="post"
                                                as="button"
                                                className="p-1.5 text-slate-400 hover:text-teal-700 rounded-lg"
                                                title="Tandai dibaca"
                                            >
                                                <Check className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* TAB 2: PREFERENCES & WEB PUSH */}
                {activeTab === 'preferensi' && (
                    <div className="space-y-6">
                        {/* Web Push Status Card */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0D827C] flex items-center justify-center font-bold">
                                    <Radio className="w-5 h-5 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-slate-800">Status Web Push (VAPID)</h3>
                                    <p className="text-xs text-slate-500">Kesiapan perangkat browser Anda untuk menerima notifikasi di luar aplikasi.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[11px] text-slate-400 font-semibold uppercase">Dukungan Browser</p>
                                    <p className="text-sm font-bold text-slate-700 mt-1">
                                        {browserSupported ? '✅ Didukung' : '❌ Tidak Didukung'}
                                    </p>
                                </div>

                                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[11px] text-slate-400 font-semibold uppercase">Izin Notifikasi</p>
                                    <p className="text-sm font-bold mt-1 capitalize text-slate-700">
                                        {permissionStatus === 'granted' ? '✅ Diberikan (Granted)' : permissionStatus === 'denied' ? '❌ Ditolak (Denied)' : '⚠️ Belum Diminta (Default)'}
                                    </p>
                                </div>

                                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[11px] text-slate-400 font-semibold uppercase">Status Langganan</p>
                                    <p className="text-sm font-bold mt-1 text-slate-700">
                                        {hasPushSubscription ? '✅ Terdaftar di Server' : '⚠️ Belum Berlangganan'}
                                    </p>
                                </div>
                            </div>

                            {/* Push Test Button */}
                            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <p className="text-xs text-slate-500">
                                    Uji pengiriman notifikasi push langsung dari server ke browser Anda.
                                </p>
                                <button
                                    onClick={handleTestPush}
                                    disabled={isTestingPush || !hasPushSubscription}
                                    className="px-4 py-2 bg-[#0D827C] hover:bg-[#064E4B] text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-40"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>{isTestingPush ? 'Mengirim Uji Coba...' : 'Kirim Uji Coba Push'}</span>
                                </button>
                            </div>

                            {testResultMessage && (
                                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs">
                                    {testResultMessage}
                                </div>
                            )}
                        </div>

                        {/* Preferences Checkboxes Form */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                            <h3 className="font-bold text-base text-slate-800">Preferensi Jenis Notifikasi</h3>
                            <p className="text-xs text-slate-500">Pilih peristiwa yang ingin Anda terima sebagai notifikasi dalam aplikasi dan Web Push.</p>

                            <form onSubmit={submitPreferences} className="space-y-3.5 pt-2">
                                {[
                                    { key: 'new_assignment', label: 'Tugas Baru Diterbitkan', desc: 'Dapatkan pemberitahuan ketika guru mempublikasikan tugas baru di kelas Anda.' },
                                    { key: 'due_soon', label: 'Pengingat Tenggat Tugas (H-1)', desc: 'Pengingat otomatis 24 jam sebelum batas waktu pengumpulan tiba.' },
                                    { key: 'overdue_reminder', label: 'Peringatan Tugas Terlambat', desc: 'Notifikasi jika ada tugas yang belum dikumpulkan setelah batas waktu.' },
                                    { key: 'deadline_extended', label: 'Perpanjangan Batas Waktu', desc: 'Diberitahu jika guru memperpanjang tenggat waktu tugas.' },
                                    { key: 'submission_received', label: 'Konfirmasi Pengumpulan Jawaban', desc: 'Pemberitahuan bahwa jawaban Anda telah berhasil tersimpan di sistem.' },
                                    { key: 'assignment_graded', label: 'Nilai & Evaluasi Tugas Keluar', desc: 'Pemberitahuan ketika guru telah memeriksa dan memberikan nilai.' },
                                    { key: 'new_announcement', label: 'Pengumuman Sekolah Baru', desc: 'Informasi dan surat edaran dari tata usaha atau wali kelas.' },
                                    { key: 'web_push', label: 'Aktifkan Notifikasi Web Push', desc: 'Izinkan penerimaan notifikasi di layar perangkat saat browser sedang diminimalkan.' },
                                ].map((item) => (
                                    <label
                                        key={item.key}
                                        className="flex items-start gap-3 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={(prefData as any)[item.key]}
                                            onChange={(e) => setPrefData(item.key as any, e.target.checked)}
                                            className="w-4 h-4 text-[#0D827C] rounded-sm focus:ring-[#0D827C] mt-0.5"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                                        </div>
                                    </label>
                                ))}

                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={prefProcessing}
                                        className="px-6 py-2.5 bg-[#0D827C] hover:bg-[#064E4B] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition disabled:opacity-50"
                                    >
                                        {prefProcessing ? 'Menyimpan...' : 'Simpan Preferensi'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

