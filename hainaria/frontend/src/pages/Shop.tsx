import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { getErrorMessage } from '../lib/api';
import { ShoppingBag, Expand } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useToast } from '../components/ui/Toast';
import { SkeletonCard } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';

interface Product {
    id: string;
    title: string;
    brand?: string;
    price: number;
    category: string;
    condition: string;
    tag?: string;
    stock?: number;
    imageUrl: string;
}

const ALL_CATEGORIES = ['Geci', 'Tricouri', 'Pulovere', 'Blugi', 'Rochii', 'Încălțăminte', 'Accesorii'];

export default function Shop() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeCategory = searchParams.get('category') || '';
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const addItem = useCartStore((s) => s.addItem);
    const { show: showToast } = useToast();

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        api.get('/products', { params: activeCategory ? { category: activeCategory } : {} })
            .then(res => { if (!cancelled) setProducts(res.data.data); })
            .catch(err => { if (!cancelled) setError(getErrorMessage(err)); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [activeCategory]);

    const handleAddToCart = (product: Product) => {
        addItem({ productId: product.id, title: product.title, price: product.price, imageUrl: product.imageUrl, quantity: 1 });
        showToast(`„${product.title}" adăugat în coș`);
    };

    const handleCategory = (cat: string) =>
        cat === activeCategory ? setSearchParams({}) : setSearchParams({ category: cat });

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

            {/* ── Header ── */}
            <div className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-baseline mb-6">
                        <h1 className="text-3xl font-bold uppercase tracking-widest" style={{ color: 'var(--text)' }}>
                            Colecție
                        </h1>
                        <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                            {loading ? '—' : `${products.length} produse`}
                        </span>
                    </div>

                    {/* Filter chips */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSearchParams({})}
                            className={!activeCategory ? 'filter-chip-active' : 'filter-chip-idle'}
                        >
                            Toate
                        </button>
                        {ALL_CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategory(cat)}
                                className={activeCategory === cat ? 'filter-chip-active' : 'filter-chip-idle'}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Grid ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                        {Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : error ? (
                    <div className="py-32 text-center border" style={{ borderColor: 'var(--border)' }}>
                        <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--error)' }}>{error}</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-32 text-center border" style={{ borderColor: 'var(--border)' }}>
                        <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>
                            Niciun produs în această categorie
                        </p>
                        <button onClick={() => setSearchParams({})} className="btn-ghost btn-sm">
                            ← Vezi toate
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                        {products.map((product) => (
                            <article key={product.id} className="product-card group">
                                {/* Image */}
                                <div className="product-card-img mb-3">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.title}
                                        loading="lazy"
                                    />

                                    {/* Tag badge */}
                                    <div className="absolute top-2.5 left-2.5 z-10">
                                        <Badge variant="dark">
                                            {(product as any).tag || (product.condition === 'SECOND_HAND' ? 'Pre-loved' : 'Outlet')}
                                        </Badge>
                                    </div>

                                    {/* Hover overlay with actions */}
                                    <div
                                        className="absolute inset-0 flex items-end justify-center gap-2 pb-4 z-10
                                                   opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        style={{ background: 'linear-gradient(to top, rgba(20,20,20,0.35) 0%, transparent 60%)' }}
                                    >
                                        <Link
                                            to={`/product/${product.id}`}
                                            className="w-9 h-9 flex items-center justify-center transition-colors"
                                            style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
                                            title="Detalii produs"
                                            aria-label={`Detalii ${product.title}`}
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <Expand className="w-3.5 h-3.5" />
                                        </Link>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="w-9 h-9 flex items-center justify-center transition-colors"
                                            style={{ background: 'var(--text)', color: 'var(--bg)' }}
                                            title="Adaugă în coș"
                                            aria-label={`Adaugă ${product.title} în coș`}
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Info */}
                                <Link to={`/product/${product.id}`} className="block" aria-label={product.title}>
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="min-w-0">
                                            <h3 className="text-[13px] font-medium truncate leading-snug" style={{ color: 'var(--text)' }}>
                                                {product.title}
                                            </h3>
                                            <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--muted)' }}>
                                                {(product as any).brand || product.category}
                                            </p>
                                        </div>
                                        <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: 'var(--text)' }}>
                                            {product.price} lei
                                        </span>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
