import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-bold text-slate-800">
                    Ubah Kata Sandi
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                    Pastikan akun Anda menggunakan kata sandi yang aman dan tidak mudah ditebak.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-4">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Kata Sandi Saat Ini"
                        className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                    />

                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full px-4 py-2 text-sm bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                        autoComplete="current-password"
                    />

                    <InputError
                        message={errors.current_password}
                        className="mt-1 text-xs"
                    />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Kata Sandi Baru"
                        className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                    />

                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full px-4 py-2 text-sm bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                        autoComplete="new-password"
                    />

                    <InputError message={errors.password} className="mt-1 text-xs" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Kata Sandi Baru"
                        className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                    />

                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        type="password"
                        className="mt-1 block w-full px-4 py-2 text-sm bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                        autoComplete="new-password"
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1 text-xs"
                    />
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-5 py-2.5 bg-[#0D827C] hover:bg-[#064E4B] text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-xs font-bold text-emerald-600">
                            Kata sandi berhasil diperbarui.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
