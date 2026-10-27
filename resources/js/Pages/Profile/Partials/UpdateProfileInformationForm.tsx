import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { PageProps } from '@/types';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage<PageProps>().props.auth.user;

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            _method: 'PATCH',
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            bio: user.bio || '',
            nip_nisn: user.nip_nisn || '',
            avatar_file: null as File | null,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Use POST with _method=PATCH for multipart file upload
        post(route('profile.post-update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-bold text-slate-800">
                    Informasi Profil
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                    Perbarui nama, kontak telepon, bio ringkas, dan foto profil akun Anda.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="name" value="Nama Lengkap" className="text-xs font-bold text-slate-700 uppercase tracking-wider" />

                        <TextInput
                            id="name"
                            className="mt-1 block w-full px-4 py-2 text-sm bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                        />

                        <InputError className="mt-1 text-xs" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Alamat Email" className="text-xs font-bold text-slate-700 uppercase tracking-wider" />

                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full px-4 py-2 text-sm bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />

                        <InputError className="mt-1 text-xs" message={errors.email} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="phone" value="Nomor WhatsApp / HP" className="text-xs font-bold text-slate-700 uppercase tracking-wider" />

                        <TextInput
                            id="phone"
                            type="text"
                            className="mt-1 block w-full px-4 py-2 text-sm bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                            value={data.phone}
                            placeholder="081234567890"
                            onChange={(e) => setData('phone', e.target.value)}
                        />

                        <InputError className="mt-1 text-xs" message={errors.phone} />
                    </div>

                    <div>
                        <InputLabel htmlFor="nip_nisn" value="NIP / NISN" className="text-xs font-bold text-slate-700 uppercase tracking-wider" />

                        <TextInput
                            id="nip_nisn"
                            type="text"
                            className="mt-1 block w-full px-4 py-2 text-sm bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                            value={data.nip_nisn}
                            placeholder="Nomor identitas sekolah"
                            onChange={(e) => setData('nip_nisn', e.target.value)}
                        />

                        <InputError className="mt-1 text-xs" message={errors.nip_nisn} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="bio" value="Bio Ringkas" className="text-xs font-bold text-slate-700 uppercase tracking-wider" />

                    <textarea
                        id="bio"
                        rows={2}
                        className="mt-1 block w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0D827C] outline-hidden"
                        value={data.bio}
                        placeholder="Tuliskan motto atau perkenalan singkat..."
                        onChange={(e) => setData('bio', e.target.value)}
                    />

                    <InputError className="mt-1 text-xs" message={errors.bio} />
                </div>

                <div>
                    <InputLabel htmlFor="avatar_file" value="Foto Profil (Avatar)" className="text-xs font-bold text-slate-700 uppercase tracking-wider" />

                    <input
                        id="avatar_file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setData('avatar_file', e.target.files ? e.target.files[0] : null)}
                        className="mt-1 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#0D827C] hover:file:bg-teal-100"
                    />

                    <InputError className="mt-1 text-xs" message={errors.avatar_file} />
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-5 py-2.5 bg-[#0D827C] hover:bg-[#064E4B] text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-xs font-bold text-emerald-600">
                            Tersimpan.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
