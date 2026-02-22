import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useToast } from '../components/ui/Toast';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ShoppingBag, Heart, ArrowLeft, Tag, Ruler, Sparkles } from 'lucide-react';

export default function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const addItem = useCartStore(s => s.addItem);
    const { show: showToast } = useToast();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [wishlisted, setWishlisted] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        api.get(`/products/${id}`)
            .then(res => { if (!cancelled) setProduct(res.data.data); })
            .catch(() => { if (!cancelled) setProduct(null); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addItem({ productId: product.id, title: product.title, price: product.price, imageUrl: product.imageUrl, quantity: 1 });
        showToast(`„${product.title}" adăugat în coș`);
    };

    const handleWishlist = () => {
        if (!user) { navigate('/login'); return; }
        setWishlisted(w => !w);
        showToast(wishlisted ? 'Scos din favorite' : 'Salvat la favorite');
    };

    /* ── Loading skeleton ── */
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ background: 'var(--bg)' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
                    <Skeleton className="w-full" style={{ aspectRatio: '3/4' }} />
                    <div className="flex flex-col gap-4 pt-4">
                        <Skeleton className="h-3 w-1/4" />
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-6 w-1/5" />
                        <Skeleton className="h-3 w-full mt-4" />
                        <Skeleton className="h-3 w-5/6" />
                        <Skeleton className="h-3 w-4/6" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Produsul nu a fost găsit.</p>
                <Link to="/shop" className="btn-ghost btn-sm">← Colecție</Link>
            </div>
        );
    }

    const conditionBadge = (): React.ComponentProps<typeof Badge>['variant'] => {
        if (product.condition === 'Nou cu etichetă') return 'success';
        if (product.condition === 'Foarte bun') return 'light';
        return 'warn';
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
            {/* ── Breadcrumb ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest transition-colors"
                    style={{ color: 'var(--muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                >
                    <ArrowLeft className="w-3 h-3" /> Înapoi
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-14">

                    {/* ── Image ── */}
                    <div className="relative overflow-hidden border" style={{ aspectRatio: '3/4', borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                        <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            loading="eager"
                        />
                        {product.tag && (
                            <div className="absolute top-4 left-4 z-10">
                                <Badge variant="dark">{product.tag}</Badge>
                            </div>
                        )}
                    </div>

                    {/* ── Info ── */}
                    <div className="flex flex-col justify-center py-4">
                        {product.brand && (
                            <p className="text-[10px] uppercase tracking-[0.35em] mb-3" style={{ color: 'var(--muted)' }}>
                                {product.brand}
                            </p>
                        )}

                        <h1 className="text-3xl font-bold leading-tight tracking-tight mb-3" style={{ color: 'var(--text)' }}>
                            {product.title}
                        </h1>

                        <p className="text-2xl font-light tracking-wide mb-8" style={{ color: 'var(--text)' }}>
                            {product.price} <span className="text-base">lei</span>
                        </p>

                        {/* Attribute badges */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            <Badge variant={conditionBadge()}>
                                <Sparkles className="w-2.5 h-2.5" />
                                {product.condition}
                            </Badge>
                            {product.size && (
                                <Badge variant="light">
                                    <Ruler className="w-2.5 h-2.5" />
                                    Mărimea {product.size}
                                </Badge>
                            )}
                            {product.category && (
                                <Badge variant="muted">
                                    <Tag className="w-2.5 h-2.5" />
                                    {product.category}
                                </Badge>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <p className="text-sm leading-relaxed mb-8 font-light" style={{ color: 'var(--muted)' }}>
                                {product.description}
                            </p>
                        )}

                        {/* Stock */}
                        <div className="flex items-center gap-2 mb-8">
                            <span className="w-2 h-2 rounded-full" style={{ background: (product.stock ?? 1) > 0 ? 'var(--success)' : 'var(--error)' }} />
                            <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                                {(product.stock ?? 1) > 0
                                    ? `${product.stock ?? 1} bucată disponibilă`
                                    : 'Stoc epuizat'}
                            </span>
                        </div>

                        {/* CTA buttons */}
                        <div className="flex flex-col gap-3">
                            {product.isTryOnCutout && (
                                <button
                                    onClick={() => navigate(`/studio?productId=${product.id}`)}
                                    className="px-6 py-4 flex justify-center items-center text-xs font-bold uppercase tracking-widest border transition-colors hover:bg-[var(--text)] hover:text-[var(--bg)]"
                                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                                >
                                    Probează în Studio
                                </button>
                            )}
                            <button
                                onClick={handleAddToCart}
                                disabled={(product.stock ?? 1) === 0}
                                className="btn-primary btn-lg w-full"
                                aria-label={`Adaugă ${product.title} în coș`}
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Adaugă în coș
                            </button>
                            <button
                                onClick={handleWishlist}
                                className={wishlisted ? 'btn-outline btn-lg w-full' : 'btn-secondary btn-lg w-full'}
                                aria-label={wishlisted ? 'Scos din favorite' : 'Salvează la favorite'}
                                aria-pressed={wishlisted}
                            >
                                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                                {wishlisted ? 'Salvat la favorite' : 'Salvează la favorite'}
                            </button>
                        </div>

                        {/* Footer info */}
                        <div className="divider mt-8" />
                        <div className="grid grid-cols-2 gap-4 mt-5 text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                            <span>Transport gratuit peste 200 lei</span>
                            <span>Retur în 14 zile</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
