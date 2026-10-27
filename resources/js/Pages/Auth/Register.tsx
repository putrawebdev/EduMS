import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { UserPlus } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Registrasi Akun Siswa - EduSpace LMS" />

            <div className="mb-6 text-center">
                <h2 className="text-xl font-extrabold text-slate-800">Daftar Akun Baru</h2>
                <p className="text-xs text-slate-500 mt-1">Buat akun siswa EduSpace LMS untuk mengakses materi dan tugas</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" className="text-xs font-bold text-slate-700 uppercase tracking-wider" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#0D827C] focus:ring-2 focus:ring-[#0D827C]/20 outline-hidden"
                        autoComplete="name"
                        isFocused={true}
                        placeholder="Contoh: Alya Putri"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-1 text-xs" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" className="text-xs font-bold text-slate-700 uppercase tracking-wider" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#0D827C] focus:ring-2 focus:ring-[#0D827C]/20 outline-hidden"
                        autoComplete="username"
                        placeholder="nama@sekolah.sch.id"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-1 text-xs" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi" className="text-xs font-bold text-slate-700 uppercase tracking-wider" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#0D827C] focus:ring-2 focus:ring-[#0D827C]/20 outline-hidden"
                        autoComplete="new-password"
                        placeholder="Minimal 8 karakter"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-1 text-xs" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Kata Sandi"
                        className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#0D827C] focus:ring-2 focus:ring-[#0D827C]/20 outline-hidden"
                        autoComplete="new-password"
                        placeholder="Ulangi kata sandi"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />

                    <InputError message={errors.password_confirmation} className="mt-1 text-xs" />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2.5 bg-[#0D827C] hover:bg-[#064E4B] text-white font-bold text-sm rounded-xl shadow-md shadow-teal-900/10 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>{processing ? 'Mendaftarkan...' : 'Daftar Akun'}</span>
                    </button>
                </div>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
                Sudah memiliki akun?{' '}
                <Link href={route('login')} className="font-bold text-[#0D827C] hover:underline">
                    Masuk Sekarang
                </Link>
            </div>
        </GuestLayout>
    );
}
