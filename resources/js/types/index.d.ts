export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'guru' | 'siswa';
    grade_level?: string;
    nip_nisn?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    unread_notifications_count?: number;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash: {
        success?: string;
        error?: string;
    };
    vapid_public_key?: string;
};
