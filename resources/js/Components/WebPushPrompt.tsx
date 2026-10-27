import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Bell, Check, X, ShieldAlert } from 'lucide-react';
import axios from 'axios';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function WebPushPrompt() {
    const { vapid_public_key } = usePage<PageProps>().props;
    const [supported, setSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [dismissed, setDismissed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
            setSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const subscribeToPush = async () => {
        if (!vapid_public_key) {
            alert('Kunci publik VAPID belum dikonfigurasi di server.');
            return;
        }

        setLoading(true);
        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm !== 'granted') {
                setLoading(false);
                return;
            }

            const registration = await navigator.serviceWorker.ready;
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                const convertedVapidKey = urlBase64ToUint8Array(vapid_public_key);
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey,
                });
            }

            const p256dh = subscription.getKey('p256dh');
            const auth = subscription.getKey('auth');

            const p256dhStr = p256dh ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(p256dh)))) : '';
            const authStr = auth ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(auth)))) : '';

            await axios.post(route('api.push-subscribe'), {
                endpoint: subscription.endpoint,
                publicKey: p256dhStr,
                authToken: authStr,
                contentEncoding: (subscription as any).supportedContentEncodings ? (subscription as any).supportedContentEncodings[0] : 'aesgcm',
            });

            setSubscribed(true);
            setTimeout(() => setDismissed(true), 3000);
        } catch (error) {
            console.error('Push subscription failed:', error);
            alert('Gagal mengaktifkan notifikasi push: ' + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

    if (!supported || permission === 'granted' || permission === 'denied' || dismissed) {
        return null;
    }

    return (
        <div className="mb-6 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#0D827C] text-white flex items-center justify-center shrink-0 shadow-sm shadow-teal-700/20">
                        <Bell className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800 text-sm sm:text-base">
                            {subscribed ? 'Notifikasi Web Push Aktif! 🎉' : 'Aktifkan Notifikasi Web Push'}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                            {subscribed
                                ? 'Perangkat ini sekarang akan menerima pengingat deadline dan informasi nilai otomatis.'
                                : 'Dapatkan pengingat deadline tugas H-1, informasi nilai keluar, dan pengumuman sekolah langsung di browser Anda.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!subscribed ? (
                        <>
                            <button
                                onClick={() => setDismissed(true)}
                                className="px-3.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100/60 rounded-xl transition"
                            >
                                Nanti Saja
                            </button>
                            <button
                                onClick={subscribeToPush}
                                disabled={loading}
                                className="px-4 py-2 text-xs font-semibold text-white bg-[#0D827C] hover:bg-[#064E4B] rounded-xl shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {loading ? 'Memproses...' : 'Izinkan Notifikasi'}
                            </button>
                        </>
                    ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-100 px-3 py-1.5 rounded-full">
                            <Check className="w-4 h-4" /> Terhubung
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

