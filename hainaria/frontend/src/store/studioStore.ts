import { create } from 'zustand';

export interface Garment {
    id: string; // unique layer id
    productId: string;
    title: string;
    price: number;
    imageUrl: string;
    garmentType: string;
    tryOnConfig?: {
        anchorX: number;
        anchorY: number;
        scale: number;
        rotationDeg: number;
    };
}

interface StudioState {
    avatarId: string | null;
    originalUrl: string | null;
    cutoutUrl: string | null;
    garments: Garment[];
    aiResultUrl: string | null;
    isProcessingAI: boolean;

    setAvatar: (id: string, originalUrl: string, cutoutUrl: string) => void;
    addGarment: (g: Garment) => void;
    removeGarment: (id: string) => void;
    setAiResultUrl: (url: string | null) => void;
    setIsProcessingAI: (isProc: boolean) => void;
    resetStudio: () => void;
}

const getFullUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const baseUrl = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace('/api', '')
        : 'http://localhost:5000';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const useStudioStore = create<StudioState>((set) => ({
    avatarId: null,
    originalUrl: null,
    cutoutUrl: null,
    garments: [], // Toate produsele selectate (pt coș)
    aiResultUrl: null, // Rezultatul de la haine (AI)
    isProcessingAI: false,

    setAvatar: (id, original, cutout) => set({
        avatarId: id,
        originalUrl: getFullUrl(original) as string,
        cutoutUrl: getFullUrl(cutout) as string
    }),
    addGarment: (g) => set((state) => {
        // Înlocuim produsul de același tip (prevent multiple hats)
        const filtered = state.garments.filter(old => old.garmentType !== g.garmentType);
        const processedG = { ...g, imageUrl: getFullUrl(g.imageUrl) as string };
        return { garments: [...filtered, processedG] };
    }),
    removeGarment: (id) => set((state) => ({ garments: state.garments.filter(g => g.id !== id) })),
    setAiResultUrl: (url) => set({ aiResultUrl: url }),
    setIsProcessingAI: (isProc) => set({ isProcessingAI: isProc }),
    resetStudio: () => set({
        avatarId: null, originalUrl: null, cutoutUrl: null, garments: [], aiResultUrl: null, isProcessingAI: false
    })
}));
