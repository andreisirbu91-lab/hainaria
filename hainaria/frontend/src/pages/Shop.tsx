import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { getErrorMessage } from '../lib/api';
import { ShoppingBag, Search, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useToast } from '../components/ui/Toast';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

interface Product {
    id: string;
    title: string;
    brand?: string;
    price: number;
    category: string;
    condition: string;
    tag?: string;
    imageUrl?: string;
    images?: Array<{ url: string }>;
}

const CATEGORIES = [
    { id: 'all', label: 'Toate Produsele' },
    { id: 'Rochii', label: 'Rochii & Fuste' },
    { id: 'Pulovere', label: 'Pulovere & Cardigane' },
    { id: 'Geci', label: 'Paltoane & Jachete' },
    { id: 'Tricouri', label: 'Topuri & Cămăși' },
    { id: 'Blugi', label: 'Pantaloni & Blugi' },
    { id: 'Accesorii', label: 'Accesorii' },
];

export default function Shop() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeCategory = searchParams.get('category') || 'all';
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const addItem = useCartStore((s) => s.addItem);
    const { show: showToast } = useToast();

    useEffect(() => {
        let cancelled = false;
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const params = activeCategory !== 'all' ? { category: activeCategory } : {};
                const res = await api.get('/public/products', { params });
                if (!cancelled) {
                    setProducts(res.data.products || res.data.data || []);
                }
            } catch (err) {
                if (!cancelled) setError(getErrorMessage(err));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchProducts();
        return () => { cancelled = true; };
    }, [activeCategory]);

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            productId: product.id,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: 1
        });
        showToast(`„${product.title}" adăugat în coș`);
    };

    const handleCategory = (catId: string) => {
        if (catId === 'all') {
            setSearchParams({});
        } else {
            setSearchParams({ category: catId });
        }
    };

    return (
        <div className="bg-hainaria-bg min-h-screen">
            {/* ── Editorial Header ── */}
            <header className="pt-32 pb-16 px-6 border-b border-hainaria-border">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-xl">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-hainaria-muted block mb-4">
                                Catalog Produse
                            </span>
                            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-hainaria-text italic leading-tight">
                                Explorează Colecția
                            </h1>
                            <p className="mt-6 text-hainaria-muted text-sm leading-relaxed font-sans">
                                O selecție de piese premium, verificate manual pentru a garanta calitatea și autenticitatea. Sustenabilitatea întâlnește eleganța atemporală.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="px-4 py-2 bg-hainaria-surface rounded-full border border-hainaria-border flex items-center gap-3">
                                <Search size={14} className="text-hainaria-muted" />
                                <input
                                    type="text"
                                    placeholder="Caută..."
                                    className="bg-transparent text-xs outline-none w-32 md:w-48 placeholder:text-hainaria-muted/50"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* ── Sidebar Filters ── */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="sticky top-32">
                            <div className="flex items-center gap-2 mb-8 text-hainaria-text">
                                <SlidersHorizontal size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest">Filtre</span>
                            </div>

                            <div className="space-y-10">
                                <section>
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-hainaria-muted mb-6">Categorii</h3>
                                    <ul className="space-y-3">
                                        {CATEGORIES.map(cat => (
                                            <li key={cat.id}>
                                                <button
                                                    onClick={() => handleCategory(cat.id)}
                                                    className={`text-sm transition-all duration-300 flex items-center justify-between w-full group ${activeCategory === cat.id
                                                        ? 'text-hainaria-text font-bold translate-x-1'
                                                        : 'text-hainaria-muted hover:text-hainaria-accent hover:translate-x-1'
                                                        }`}
                                                >
                                                    {cat.label}
                                                    {activeCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-hainaria-gold" />}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-hainaria-muted mb-6">Condiție</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {['Toate', 'Nou', 'Pre-loved'].map(c => (
                                            <button key={c} className="px-3 py-1.5 border border-hainaria-border rounded-full text-[10px] uppercase tracking-widest hover:bg-hainaria-surface transition-colors">
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </aside>

                    {/* ── Main Content ── */}
                    <main className="flex-grow">
                        {/* Status Bar */}
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-hainaria-border/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-hainaria-muted">
                                {loading ? 'Se încarcă...' : `${products.length} Rezultate`}
                            </span>
                            <button className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-hainaria-text font-bold">
                                Sortează: Cele mai noi <ChevronDown size={12} />
                            </button>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="space-y-4">
                                        <Skeleton className="aspect-[3/4] w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                        <Skeleton className="h-4 w-1/3" />
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="py-24 text-center">
                                <p className="text-hainaria-muted italic mb-6">{error}</p>
                                <Button variant="outline" onClick={() => window.location.reload()}>Reîncearcă</Button>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="py-24 text-center">
                                <h3 className="font-serif italic text-2xl text-hainaria-text mb-4">Niciun rezultat</h3>
                                <p className="text-hainaria-muted text-sm mb-8">Nu am găsit produse în această categorie momentan.</p>
                                <Button variant="accent" onClick={() => handleCategory('all')}>Vezi Toate Produsele</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                                {products.map((product) => (
                                    <Link
                                        key={product.id}
                                        to={`/product/${product.id}`}
                                        className="group"
                                    >
                                        <div className="relative aspect-[3/4] overflow-hidden rounded-[18px] bg-hainaria-surface mb-5 shadow-sm group-hover:shadow-xl transition-all duration-500">
                                            <img
                                                src={product.images?.[0]?.url || product.imageUrl || "https://images.unsplash.com/photo-1539109132314-347f8541e4a0?auto=format&fit=crop&q=80&w=800"}
                                                alt={product.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            {/* Badge */}
                                            {product.tag && (
                                                <div className="absolute top-4 left-4 z-10">
                                                    <span className="px-3 py-1 bg-hainaria-text/90 backdrop-blur-sm text-white text-[8px] font-bold uppercase tracking-[0.2em] rounded-full">
                                                        {product.tag}
                                                    </span>
                                                </div>
                                            )}
                                            {/* Quick Add Overlay */}
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                                <button
                                                    onClick={(e) => handleAddToCart(e, product)}
                                                    className="w-full py-3 bg-white/90 backdrop-blur-md text-hainaria-text text-[10px] font-bold uppercase tracking-widest rounded-[14px] flex items-center justify-center gap-2 hover:bg-white transition-colors translate-y-4 group-hover:translate-y-0 duration-500"
                                                >
                                                    <ShoppingBag size={14} /> Adaugă în Coș
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-sm font-serif italic text-hainaria-text">{product.title}</h3>
                                                <span className="text-sm font-bold text-hainaria-text">{product.price} lei</span>
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-hainaria-muted">
                                                {product.brand || product.category}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
