import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout>
            <Head title="Profil Saya - EduSpace LMS" />

            <div className="space-y-6 max-w-4xl mx-auto">
                <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                        Pengaturan Profil
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                        Kelola informasi akun pribadi, kontak, dan keamanan kata sandi Anda.
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-2xl"
                    />
                </div>

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
                    <UpdatePasswordForm className="max-w-2xl" />
                </div>

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
                    <DeleteUserForm className="max-w-2xl" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
