import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { LogIn, Key, Sparkles, User, GraduationCap, Shield } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const fillDemo = (email: string) => {
        setData({
            email,
            password: 'password',
            remember: true,
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk - EduSpace LMS" />

            <div className="mb-6 text-center">
                <h2 className="text-xl font-extrabold text-slate-800">Selamat Datang Kembali</h2>
                <p className="text-xs text-slate-500 mt-1">Masukkan kredensial akun sekolah Anda untuk melanjutkan</p>
            </div>

            {status && (
                <div className="mb-4 text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    {status}
                </div>
            )}

            {/* Quick Demo Login Fillers */}
            <div className="mb-6 p-3.5 bg-teal-50/60 border border-teal-200/70 rounded-2xl">
                <p className="text-[11px] font-bold text-teal-900 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Akun Demo Cepat (1-Klik Isi):</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => fillDemo('alya@eduspace.test')}
                        className="px-2 py-1.5 bg-white text-slate-700 hover:text-teal-800 hover:border-teal-300 border border-slate-200 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                    >
                        <User className="w-3 h-3 text-teal-600" />
                        <span>Siswa</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => fillDemo('rina@eduspace.test')}
                        className="px-2 py-1.5 bg-white text-slate-700 hover:text-teal-800 hover:border-teal-300 border border-slate-200 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                    >
                        <GraduationCap className="w-3 h-3 text-teal-600" />
                        <span>Guru</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => fillDemo('admin@eduspace.test')}
                        className="px-2 py-1.5 bg-white text-slate-700 hover:text-teal-800 hover:border-teal-300 border border-slate-200 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                    >
                        <Shield className="w-3 h-3 text-teal-600" />
                        <span>Admin</span>
                    </button>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" className="text-xs font-bold text-slate-700 uppercase tracking-wider" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#0D827C] focus:ring-2 focus:ring-[#0D827C]/20 outline-hidden"
                        autoComplete="username"
                        isFocused={true}
                        placeholder="nama@sekolah.sch.id"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-1 text-xs" />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Kata Sandi" className="text-xs font-bold text-slate-700 uppercase tracking-wider" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-semibold text-[#0D827C] hover:underline"
                            >
                                Lupa kata sandi?
                            </Link>
                        )}
                    </div>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#0D827C] focus:ring-2 focus:ring-[#0D827C]/20 outline-hidden"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-1 text-xs" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded-sm text-[#0D827C] focus:ring-[#0D827C]"
                        />
                        <span className="text-xs font-medium text-slate-600">Ingat perangkat ini</span>
                    </label>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2.5 bg-[#0D827C] hover:bg-[#064E4B] text-white font-bold text-sm rounded-xl shadow-md shadow-teal-900/10 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>{processing ? 'Masuk...' : 'Masuk ke Akun'}</span>
                    </button>
                </div>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
                Belum memiliki akun?{' '}
                <Link href={route('register')} className="font-bold text-[#0D827C] hover:underline">
                    Daftar Akun Baru
                </Link>
            </div>
        </GuestLayout>
    );
}
