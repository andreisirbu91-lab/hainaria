import { create } from 'zustand';

export interface Garment {
    id: string; // unique layer id
    productId: string;
    title: string;
    price: number;
    imageUrl: string;
    garmentType: string;
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
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
};

export const useStudioStore = create<StudioState>((set) => ({
    avatarId: null,
    originalUrl: null,
    cutoutUrl: null,
    garments: [],
    aiResultUrl: null,
    isProcessingAI: false,

    setAvatar: (id, original, cutout) => set({
        avatarId: id,
        originalUrl: getFullUrl(original) as string,
        cutoutUrl: getFullUrl(cutout) as string
    }),
    addGarment: (g) => set((state) => {
        const existing = state.garments.filter(old => old.garmentType !== g.garmentType);
        const processedG = { ...g, imageUrl: getFullUrl(g.imageUrl) as string };
        return { garments: [...existing, processedG] };
    }),
    removeGarment: (id) => set((state) => ({ garments: state.garments.filter(g => g.id !== id) })),
    setAiResultUrl: (url) => set({ aiResultUrl: url }),
    setIsProcessingAI: (isProc) => set({ isProcessingAI: isProc }),
    resetStudio: () => set({
        avatarId: null, originalUrl: null, cutoutUrl: null, garments: [], aiResultUrl: null, isProcessingAI: false
    })
}));
