import { create } from 'zustand';
import api from '../lib/api';

export type TryOnStatus =
    | 'CREATED' | 'UPLOADED' | 'BG_REMOVAL_QUEUED' | 'BG_REMOVAL_DONE'
    | 'READY_FOR_TRYON' | 'TRYON_QUEUED' | 'TRYON_DONE' | 'IN_CART'
    | 'CHECKOUT_STARTED' | 'PAID' | 'COMPLETED' | 'FAILED';

interface TryOnSession {
    id: string;
    status: TryOnStatus;
    currentResultUrl?: string;
    assets: any[];
}

interface TryOnStore {
    sessionId: string | null;
    session: TryOnSession | null;
    isLoading: boolean;
    error: string | null;
    selectedProduct: any | null;

    createSession: () => Promise<void>;
    fetchSession: (id: string, isRetry?: boolean) => Promise<void>;
    pollSession: (id: string) => void;

    uploadImage: (file: File) => Promise<void>;
    startBgRemove: () => Promise<void>;
    startTryOn: (productId: string) => Promise<void>;

    reset: () => void;
}

let pollInterval: any = null;

export const useTryOnStore = create<TryOnStore>((set, get) => ({
    sessionId: localStorage.getItem('tryon_session_id'),
    session: null,
    isLoading: false,
    error: null,
    selectedProduct: null,

    createSession: async () => {
        set({ isLoading: true });
        try {
            const res = await api.post('/tryon/session');
            localStorage.setItem('tryon_session_id', res.data.sessionId);
            set({ sessionId: res.data.sessionId, isLoading: false });
            await get().fetchSession(res.data.sessionId, true);
        } catch (err) {
            set({ error: 'Failed to create session', isLoading: false });
        }
    },

    fetchSession: async (id: string, isRetry = false) => {
        try {
            const res = await api.get(`/tryon/${id}`);
            const session = res.data.session;

            // Resolve relative asset URLs to the backend base URL
            const backendBase = (import.meta.env.VITE_API_URL || '/api').replace('/api', '');
            if (session.assets) {
                session.assets = session.assets.map((a: any) => ({
                    ...a,
                    url: a.url.startsWith('http') ? a.url : `${backendBase}${a.url}`
                }));
            }
            // Also resolve currentResultUrl
            if (session.currentResultUrl && !session.currentResultUrl.startsWith('http')) {
                session.currentResultUrl = `${backendBase}${session.currentResultUrl}`;
            }

            set({ session, sessionId: id, isLoading: false, error: null });

            // Auto-polling logic
            if (['BG_REMOVAL_QUEUED', 'TRYON_QUEUED'].includes(session.status)) {
                get().pollSession(id);
            } else {
                if (pollInterval) clearInterval(pollInterval);
            }
        } catch (err: any) {
            console.warn('Stale TryOn session or fetch error:', err.message);
            if (pollInterval) clearInterval(pollInterval);

            if (!isRetry) {
                console.log('Attempting to create a new session...');
                localStorage.removeItem('tryon_session_id');
                await get().createSession();
            } else {
                console.error('Failed to create and fetch a new session. Stopping loop.');
                set({ sessionId: null, session: null, error: 'A apărut o problemă de conexiune cu serverul. Te rugăm să reîncarci pagina.', isLoading: false });
            }
        }
    },

    pollSession: (id: string) => {
        if (pollInterval) clearInterval(pollInterval);
        pollInterval = setInterval(() => {
            get().fetchSession(id);
        }, 3000);
    },

    uploadImage: async (file: File) => {
        const id = get().sessionId;
        if (!id) return;
        set({ isLoading: true });
        const formData = new FormData();
        formData.append('image', file);
        try {
            await api.post(`/tryon/${id}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await get().fetchSession(id);
        } catch (err) {
            set({ error: 'Upload failed', isLoading: false });
        }
    },

    startBgRemove: async () => {
        const id = get().sessionId;
        if (!id) return;
        set({ isLoading: true, error: null });
        try {
            await api.post(`/tryon/${id}/bg-remove`);
            await get().fetchSession(id);
        } catch (err) {
            set({ error: 'BG Removal failed', isLoading: false });
            throw err; // Re-throw so UI can catch it
        }
    },

    startTryOn: async (product: any) => {
        const id = get().sessionId;
        if (!id) return;
        set({ selectedProduct: product });
        try {
            await api.post(`/tryon/${id}/try`, { productId: product.id });
            await get().fetchSession(id);
        } catch (err) {
            set({ error: 'Try-On failed' });
        }
    },

    reset: () => {
        localStorage.removeItem('tryon_session_id');
        if (pollInterval) clearInterval(pollInterval);
        set({ sessionId: null, session: null, error: null });
    }
}));
