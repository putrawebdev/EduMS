import React, { useState, PropsWithChildren, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    LayoutDashboard,
    GraduationCap,
    FileText,
    ClipboardList,
    Calendar,
    Bell,
    User,
    Settings,
    Search,
    LogOut,
    Menu,
    X,
    Sun,
    Users,
    BookOpen,
    CheckCircle,
    AlertCircle,
    ChevronDown,
} from 'lucide-react';
import WebPushPrompt from '@/Components/WebPushPrompt';

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, flash } = usePage<PageProps>().props;
    const user = auth.user;
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const isCurrent = (routePrefix: string) => {
        return window.location.pathname.startsWith(routePrefix);
    };

    const navItems = [
        {
            name: 'Dashboard',
            href: route('dashboard'),
            icon: LayoutDashboard,
            active: window.location.pathname === '/dashboard',
        },
        {
            name: 'Kelas Saya',
            href: route('classes.index'),
            icon: GraduationCap,
            active: isCurrent('/kelas'),
        },
        {
            name: 'Materi',
            href: route('materials.index'),
            icon: FileText,
            active: isCurrent('/materi'),
        },
        {
            name: 'Tugas',
            href: route('assignments.index'),
            icon: ClipboardList,
            active: isCurrent('/tugas'),
        },
        {
            name: 'Kalender',
            href: route('schedules.index'),
            icon: Calendar,
            active: isCurrent('/jadwal'),
        },
        {
            name: 'Notifikasi',
            href: route('notifications.index'),
            icon: Bell,
            active: isCurrent('/notifikasi'),
            badge: user?.unread_notifications_count && user.unread_notifications_count > 0 ? user.unread_notifications_count : null,
        },
        {
            name: 'Profil',
            href: route('profile.edit'),
            icon: User,
            active: isCurrent('/profile'),
        },
    ];

    const adminNavItems = user?.role === 'admin' ? [
        {
            name: 'Kelola Pengguna',
            href: route('admin.users.index'),
            icon: Users,
            active: isCurrent('/admin/pengguna'),
        },
        {
            name: 'Mata Pelajaran',
            href: route('admin.subjects.index'),
            icon: BookOpen,
            active: isCurrent('/admin/mata-pelajaran'),
        },
    ] : [];

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Administrator';
            case 'guru':
                return 'Guru Pengampu';
            default:
                return user?.grade_level ? `Siswa • ${user.grade_level}` : 'Siswa';
        }
    };

    const getInitials = (name: string) => {
        return name
            ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
            : 'ES';
    };

    return (
        <div className="min-h-screen flex bg-[#F8FAFC]">
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden lg:flex flex-col w-64 bg-[#064E4B] text-white shrink-0 sticky top-0 h-screen select-none z-30">
                {/* Brand Logo */}
                <div className="p-6 pb-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/15 shadow-inner">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-white leading-tight">
                            EduSpace
                        </h1>
                        <p className="text-[11px] font-medium text-teal-200/80 tracking-wide uppercase">
                            LMS Portal
                        </p>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 scrollbar-thin scrollbar-thumb-teal-800">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                                    item.active
                                        ? 'bg-[#0D827C] text-white shadow-md shadow-teal-950/20 font-semibold'
                                        : 'text-teal-100/75 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <Icon className={`w-5 h-5 ${item.active ? 'text-white' : 'text-teal-200/70'}`} />
                                    <span>{item.name}</span>
                                </div>
                                {item.badge && (
                                    <span className="bg-[#16B8A6] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    {adminNavItems.length > 0 && (
                        <div className="pt-4 pb-1">
                            <p className="px-3 text-[11px] font-bold text-teal-200/50 uppercase tracking-wider">
                                Menu Admin
                            </p>
                            <div className="mt-2 space-y-1.5">
                                {adminNavItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                                                item.active
                                                    ? 'bg-[#0D827C] text-white shadow-md font-semibold'
                                                    : 'text-teal-100/75 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <Icon className="w-5 h-5 text-teal-200/70" />
                                                <span>{item.name}</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Bottom Quote Card */}
                <div className="p-4 pt-2">
                    <div className="bg-[#043E3B] border border-teal-700/40 rounded-2xl p-3.5 relative overflow-hidden">
                        <div className="flex items-start gap-2.5">
                            <Sun className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed text-teal-100/90 font-medium">
                                Terus belajar, karena masa depan berawal dari hari ini.
                            </p>
                        </div>
                        {/* Decorative leaf watermark */}
                        <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none">
                            <BookOpen className="w-16 h-16 text-teal-200" />
                        </div>
                    </div>
                </div>
            </aside>

            {/* MOBILE DRAWER */}
            {mobileDrawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setMobileDrawerOpen(false)}
                    />
                    <div className="relative flex flex-col w-72 max-w-[80%] bg-[#064E4B] text-white p-5 shadow-2xl z-10">
                        <div className="flex items-center justify-between pb-4 border-b border-white/10">
                            <div className="flex items-center gap-2.5">
                                <BookOpen className="w-6 h-6 text-white" />
                                <span className="font-bold text-lg">EduSpace</span>
                            </div>
                            <button
                                onClick={() => setMobileDrawerOpen(false)}
                                className="p-1.5 rounded-lg bg-white/10 text-teal-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-4 space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileDrawerOpen(false)}
                                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                                            item.active
                                                ? 'bg-[#0D827C] text-white font-semibold'
                                                : 'text-teal-100/80 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-5 h-5" />
                                            <span>{item.name}</span>
                                        </div>
                                        {item.badge && (
                                            <span className="bg-[#16B8A6] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}

                            {adminNavItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileDrawerOpen(false)}
                                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                                            item.active ? 'bg-[#0D827C] text-white' : 'text-teal-100/80 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-5 h-5" />
                                            <span>{item.name}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center font-bold text-sm">
                                    {getInitials(user?.name || '')}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-semibold truncate">{user?.name}</p>
                                    <p className="text-xs text-teal-200/70">{user?.role}</p>
                                </div>
                            </div>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="p-2 text-rose-300 hover:text-white rounded-lg bg-rose-500/20"
                            >
                                <LogOut className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
                {/* TOP HEADER */}
                <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
                    {/* Left: Mobile hamburger & Search bar */}
                    <div className="flex items-center gap-3 flex-1 max-w-lg">
                        <button
                            onClick={() => setMobileDrawerOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-hidden"
                            aria-label="Buka menu navigasi"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="relative w-full max-w-md hidden sm:block">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari kelas, materi, atau tugas..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:bg-white focus:border-[#0D827C] focus:ring-2 focus:ring-[#0D827C]/20 transition-all outline-hidden"
                            />
                        </div>
                    </div>

                    {/* Right: Notifications & User profile */}
                    <div className="flex items-center gap-3 sm:gap-5">
                        {/* Notification Bell */}
                        <Link
                            href={route('notifications.index')}
                            className="relative p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
                            title="Notifikasi"
                        >
                            <Bell className="w-5 h-5 text-slate-600" />
                            {user?.unread_notifications_count && user.unread_notifications_count > 0 ? (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                                    {user.unread_notifications_count}
                                </span>
                            ) : null}
                        </Link>

                        {/* User Avatar & Name */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 transition focus:outline-hidden"
                            >
                                <div className="w-10 h-10 rounded-full bg-teal-100 text-[#0D827C] font-bold text-sm flex items-center justify-center border-2 border-teal-500/20 overflow-hidden shadow-xs shrink-0">
                                    {user?.avatar ? (
                                        <img src={`/storage/${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{getInitials(user?.name || '')}</span>
                                    )}
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-bold text-slate-800 leading-tight">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {getRoleBadge(user?.role || 'siswa')}
                                    </p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
                            </button>

                            {/* Profile Dropdown */}
                            {profileDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setProfileDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-40 animate-in fade-in duration-150">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                        </div>
                                        <Link
                                            href={route('profile.edit')}
                                            onClick={() => setProfileDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                                        >
                                            <User className="w-4 h-4 text-slate-400" />
                                            <span>Profil Saya</span>
                                        </Link>
                                        <Link
                                            href={route('notifications.index')}
                                            onClick={() => setProfileDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                                        >
                                            <Settings className="w-4 h-4 text-slate-400" />
                                            <span>Preferensi Notifikasi</span>
                                        </Link>
                                        <div className="border-t border-slate-100 my-1" />
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition text-left"
                                        >
                                            <LogOut className="w-4 h-4 text-rose-500" />
                                            <span>Keluar</span>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* FLASH NOTIFICATIONS */}
                <div className="px-4 sm:px-6 lg:px-8 pt-4">
                    {flash?.success && (
                        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-sm shadow-xs animate-in fade-in duration-200">
                            <div className="flex items-center gap-2.5">
                                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span className="font-medium">{flash.success}</span>
                            </div>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center justify-between text-sm shadow-xs animate-in fade-in duration-200">
                            <div className="flex items-center gap-2.5">
                                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                <span className="font-medium">{flash.error}</span>
                            </div>
                        </div>
                    )}

                    {/* Web Push Prompt */}
                    <WebPushPrompt />
                </div>

                {/* PAGE CONTENT */}
                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-2 md:py-4">
                    {children}
                </main>
            </div>

            {/* MOBILE BOTTOM NAVIGATION BAR */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/90 px-2 py-2 flex items-center justify-around z-30 shadow-lg">
                <Link
                    href={route('dashboard')}
                    className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                        window.location.pathname === '/dashboard' ? 'text-[#0D827C]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Dashboard</span>
                </Link>

                <Link
                    href={route('classes.index')}
                    className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                        isCurrent('/kelas') ? 'text-[#0D827C]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <GraduationCap className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Kelas</span>
                </Link>

                <Link
                    href={route('assignments.index')}
                    className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                        isCurrent('/tugas') ? 'text-[#0D827C]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <ClipboardList className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Tugas</span>
                </Link>

                <Link
                    href={route('notifications.index')}
                    className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl relative transition ${
                        isCurrent('/notifikasi') ? 'text-[#0D827C]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <Bell className="w-5 h-5" />
                    {user?.unread_notifications_count && user.unread_notifications_count > 0 ? (
                        <span className="absolute top-0 right-3 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {user.unread_notifications_count}
                        </span>
                    ) : null}
                    <span className="text-[10px] font-semibold">Notifikasi</span>
                </Link>

                <Link
                    href={route('profile.edit')}
                    className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                        isCurrent('/profile') ? 'text-[#0D827C]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <User className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Profil</span>
                </Link>
            </nav>
        </div>
    );
}
