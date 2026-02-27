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

// Helper to get admin-specific axios config with Bearer token
function adminHeaders() {
    const token = localStorage.getItem('admin_token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
    admin: null,
    isLoading: true,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/admin/auth/login', { email, password });
            localStorage.setItem('admin_token', res.data.token);
            set({ admin: res.data.admin, isLoading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Login failed', isLoading: false });
            throw err;
        }
    },

    logout: async () => {
        try {
            await api.post('/admin/auth/logout', {}, adminHeaders());
            localStorage.removeItem('admin_token');
            set({ admin: null });
        } catch (err) {
            localStorage.removeItem('admin_token');
            set({ admin: null });
        }
    },

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const res = await api.get('/admin/auth/me', adminHeaders());
            set({ admin: res.data.admin, isLoading: false });
        } catch (err) {
            localStorage.removeItem('admin_token');
            set({ admin: null, isLoading: false });
        }
    }
}));
