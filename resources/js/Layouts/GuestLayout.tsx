import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { BookOpen } from 'lucide-react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/50 p-4 sm:p-6">
            <div className="w-full sm:max-w-md flex flex-col items-center mb-6">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#0D827C] text-white flex items-center justify-center shadow-lg shadow-teal-800/20 group-hover:bg-[#064E4B] transition">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">
                            EduSpace
                        </h1>
                        <p className="text-xs font-semibold text-[#0D827C] tracking-wide uppercase">
                            Learning Management System
                        </p>
                    </div>
                </Link>
            </div>

            <div className="w-full sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                {children}
            </div>

            <p className="mt-8 text-xs text-slate-400 font-medium">
                © {new Date().getFullYear()} EduSpace LMS. Seluruh Hak Cipta Dilindungi.
            </p>
        </div>
    );
}
