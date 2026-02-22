import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    role?: string;
    avatarUrl?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
}

const TOKEN_KEY = 'hainaria_token';
const USER_KEY = 'hainaria_user';

export const useAuthStore = create<AuthState>((set) => ({
    user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
    token: localStorage.getItem(TOKEN_KEY) || null,
    login: (user, token) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem(TOKEN_KEY, token);
        set({ user, token });
    },
    logout: () => {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        set({ user: null, token: null });
    },
}));
