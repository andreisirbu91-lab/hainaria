import { create } from 'zustand';
import api from '../lib/api';

export type TryOnStatus =
    | 'CREATED' | 'UPLOADED' | 'BG_REMOVAL_QUEUED' | 'BG_REMOVAL_DONE'
    | 'READY_FOR_TRYON' | 'TRYON_QUEUED' | 'TRYON_DONE'
    | 'IN_CART' | 'FAILED';

interface TryOnState {
    sessionId: string | null;
    status: TryOnStatus;
    currentResultUrl: string | null;
    error: string | null;

    // Actions
    initSession: () => Promise<void>;
    uploadImage: (file: File) => Promise<void>;
    triggerBgRemoval: () => Promise<void>;
    pollStatus: () => Promise<void>;
    reset: () => void;
}

export const useTryOnStore = create<TryOnState>((set, get) => ({
    sessionId: null,
    status: 'CREATED',
    currentResultUrl: null,
    error: null,

    initSession: async () => {
        try {
            const res = await api.post('/tryon/session');
            set({ sessionId: res.data.sessionId, status: 'CREATED', error: null });
        } catch (err) {
            set({ error: 'Failed to initialize session' });
        }
    },

    uploadImage: async (file: File) => {
        const { sessionId } = get();
        if (!sessionId) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post(`/tryon/${sessionId}/upload`, formData);
            set({ status: res.data.status });
        } catch (err) {
            set({ error: 'Upload failed' });
        }
    },

    triggerBgRemoval: async () => {
        const { sessionId } = get();
        if (!sessionId) return;

        try {
            const res = await api.post(`/tryon/${sessionId}/bg-remove`);
            set({ status: res.data.status });
        } catch (err) {
            set({ error: 'Failed to start background removal' });
        }
    },

    pollStatus: async () => {
        const { sessionId } = get();
        if (!sessionId) return;

        try {
            const res = await api.get(`/tryon/${sessionId}`);
            const { status, currentResultUrl } = res.data.session;
            set({ status, currentResultUrl });
        } catch (err) {
            // silent fail on poll
        }
    },

    reset: () => set({ sessionId: null, status: 'CREATED', currentResultUrl: null, error: null })
}));
