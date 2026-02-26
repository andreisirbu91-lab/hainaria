import { create } from 'zustand';
import api from '../lib/api';

interface Product {
    id?: string;
    title: string;
    description: string;
    price: number;
    salePrice?: number | null;
    sku?: string | null;
    stock: number;
    status: 'DRAFT' | 'PUBLISHED';
    category?: string | null;
    brand?: string | null;
    images?: any[];
}

interface ProductStore {
    products: Product[];
    loading: boolean;
    fetchProducts: () => Promise<void>;
    saveProduct: (product: Partial<Product>) => Promise<Product>;
    deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
    products: [],
    loading: false,
    fetchProducts: async () => {
        set({ loading: true });
        try {
            const res = await api.get('/admin/products');
            set({ products: res.data.products, loading: false });
        } catch (err) {
            set({ loading: false });
            throw err;
        }
    },
    saveProduct: async (product) => {
        const method = product.id ? 'patch' : 'post';
        const url = product.id ? `/admin/products/${product.id}` : '/admin/products';
        const res = await api[method](url, product);
        return res.data.product;
    },
    deleteProduct: async (id) => {
        await api.delete(`/admin/products/${id}`);
        set(state => ({ products: state.products.filter(p => p.id !== id) }));
    }
}));
