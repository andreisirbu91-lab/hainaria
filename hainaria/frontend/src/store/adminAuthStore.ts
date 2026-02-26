import { create } from 'zustand';
import api from '../lib/api';

export type AdminRole = 'ADMIN' | 'EDITOR' | 'SUPPORT';

interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
}

interface AdminAuthState {
    admin: AdminUser | null;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
    admin: null,
    isLoading: true,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/admin/auth/login', { email, password });
            set({ admin: res.data.admin, isLoading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Login failed', isLoading: false });
            throw err;
        }
    },

    logout: async () => {
        try {
            await api.post('/admin/auth/logout');
            set({ admin: null });
        } catch (err) {
            console.error('Logout failed', err);
        }
    },

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const res = await api.get('/admin/auth/me');
            set({ admin: res.data.admin, isLoading: false });
        } catch (err) {
            set({ admin: null, isLoading: false });
        }
    }
}));
