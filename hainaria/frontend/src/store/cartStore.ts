import { create } from 'zustand';

interface CartItem {
    productId: string;
    title: string;
    price: number;
    imageUrl: string;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.productId === item.productId);
        if (existing) {
            return { items: state.items.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i) };
        }
        return { items: [...state.items, { ...item, quantity: 1 }] };
    }),
    removeItem: (productId) => set((state) => ({
        items: state.items.filter(i => i.productId !== productId)
    })),
    updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(i => i.productId === productId ? { ...i, quantity } : i)
    })),
    clearCart: () => set({ items: [] }),
    total: () => get().items.reduce((acc, current) => acc + current.price * current.quantity, 0),
}));
