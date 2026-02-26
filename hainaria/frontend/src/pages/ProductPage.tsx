import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useToast } from '../components/ui/Toast';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { ShoppingBag, Heart, ArrowLeft, Ruler, Sparkles, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

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
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/public/products/${id}`);
                if (!cancelled) {
                    setProduct(res.data.product || res.data.data);
                }
            } catch (err) {
                if (!cancelled) setProduct(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        if (id) fetchProduct();
        return () => { cancelled = true; };
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addItem({
            productId: product.id,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: 1
        });
        showToast(`„${product.title}" adăugat în coș`);
    };

    const handleWishlist = () => {
        if (!user) { navigate('/login'); return; }
        setWishlisted(w => !w);
        showToast(wishlisted ? 'Scos din favorite' : 'Salvat la favorite');
    };

    if (loading) {
        return (
            <div className="bg-hainaria-bg min-h-screen pt-32 pb-24 px-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        <Skeleton className="aspect-[3/4] w-full rounded-[24px]" />
                        <div className="space-y-8">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-16 w-3/4" />
                            <Skeleton className="h-8 w-1/5" />
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                            <Skeleton className="h-14 w-full rounded-[14px]" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="bg-hainaria-bg min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center text-center">
                <h1 className="font-serif text-3xl text-hainaria-text mb-4 italic">PRODUS NEIDENTIFICAT</h1>
                <p className="text-hainaria-muted uppercase tracking-widest text-xs mb-8">Ne cerem scuze, dar acest produs nu mai este disponibil.</p>
                <Button variant="outline" href="/shop">Înapoi la Colecție</Button>
            </div>
        );
    }

    return (
        <div className="bg-hainaria-bg min-h-screen pt-32 pb-24 px-6">
            <div className="container mx-auto max-w-7xl">
                {/* ── Breadcrumb ── */}
                <nav className="mb-12 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-hainaria-muted hover:text-hainaria-text transition-colors"
                    >
                        <ArrowLeft size={14} /> Înapoi
                    </button>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-hainaria-muted font-bold">
                        Hainaria / {product.category} / <span className="text-hainaria-text">{product.title}</span>
                    </div>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    {/* ── Visuals ── */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative aspect-[3/4] rounded-[24px] overflow-hidden shadow-2xl bg-hainaria-surface"
                        >
                            <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                            {product.tag && (
                                <div className="absolute top-6 left-6 z-10">
                                    <Badge variant="dark" className="px-5 py-2 text-[10px] shadow-lg">
                                        {product.tag}
                                    </Badge>
                                </div>
                            )}
                        </motion.div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 pt-6">
                            {[
                                { icon: Truck, text: 'Transport gratuit' },
                                { icon: ShieldCheck, text: 'Calitate garantată' },
                                { icon: RotateCcw, text: 'Retur 14 zile' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center text-center p-4 bg-hainaria-surface/40 rounded-[18px] border border-hainaria-border/50">
                                    <item.icon size={16} className="text-hainaria-gold mb-2" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-hainaria-muted">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Editorial Details ── */}
                    <div className="flex flex-col">
                        <header className="mb-10">
                            {product.brand && (
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-hainaria-muted block mb-4">
                                    {product.brand}
                                </span>
                            )}
                            <h1 className="font-serif text-4xl md:text-5xl text-hainaria-text italic leading-tight mb-6">
                                {product.title}
                            </h1>
                            <div className="flex items-center gap-6">
                                <span className="text-3xl font-light text-hainaria-text">
                                    {product.price} <span className="text-sm">RON</span>
                                </span>
                                <Badge variant="outline" className="text-[10px]">
                                    {product.condition}
                                </Badge>
                            </div>
                        </header>

                        <div className="prose prose-sm prose-hainaria mb-12 text-hainaria-muted leading-relaxed font-sans">
                            <p>{product.description || "O piesă vestimentară premium, selectată manual pentru colecția noastră boutique. Design atemporal cu o atenție sporită la detalii."}</p>
                        </div>

                        {/* Specs */}
                        <div className="grid grid-cols-2 gap-8 mb-12">
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-hainaria-text mb-3">Mărime</h4>
                                <div className="flex items-center gap-2 p-3 bg-hainaria-surface rounded-[14px] border border-hainaria-border">
                                    <Ruler size={14} className="text-hainaria-gold" />
                                    <span className="text-sm font-bold text-hainaria-text">{product.size || 'Unică'}</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-hainaria-text mb-3">Disponibilitate</h4>
                                <div className="flex items-center gap-2 p-3">
                                    <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-hainaria-muted">
                                        {product.stock > 0 ? `${product.stock} bucăți` : 'Stoc Epuizat'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CTA Cluster */}
                        <div className="flex flex-col gap-4">
                            {product.isTryOnCutout && (
                                <Button
                                    variant="gold"
                                    size="lg"
                                    fullWidth
                                    href={`/studio?productId=${product.id}`}
                                    className="gap-3 shadow-xl hover:shadow-gold/20"
                                >
                                    <Sparkles size={18} /> Probează în Studio VTO
                                </Button>
                            )}
                            <div className="flex gap-4">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    disabled={product.stock <= 0}
                                    onClick={handleAddToCart}
                                    className="flex-grow gap-2"
                                >
                                    <ShoppingBag size={18} /> Adaugă în Coș
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={handleWishlist}
                                    className={`px-4 ${wishlisted ? 'border-pink-200 bg-pink-50' : ''}`}
                                >
                                    <Heart size={20} className={wishlisted ? 'fill-pink-500 text-pink-500' : 'text-hainaria-text'} />
                                </Button>
                            </div>
                        </div>

                        {/* Extra info accordion (Simplified) */}
                        <div className="mt-16 space-y-6 pt-8 border-t border-hainaria-border">
                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer list-none text-[10px] font-bold uppercase tracking-[0.2em] text-hainaria-text">
                                    Detalii Livrare & Retur
                                    <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="pt-4 text-xs text-hainaria-muted leading-relaxed italic">
                                    Livrare standard în 2-3 zile lucrătoare. Retur gratuit în primele 14 zile dacă produsul nu corespunde așteptărilor tale. Produsele pre-loved trec printr-un proces riguros de igienizare.
                                </div>
                            </details>
                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer list-none text-[10px] font-bold uppercase tracking-[0.2em] text-hainaria-text">
                                    Garanția Hainaria
                                    <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="pt-4 text-xs text-hainaria-muted leading-relaxed italic">
                                    Fiecare piesă este autentificată de experții noștri. Garantăm calitatea descrisă și oferim asistență post-vânzare pentru a asigura o experiență premium.
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Added missing ChevronDown import in the cluster above, but I'll ensure it's in the top level if not already.
import { ChevronDown } from 'lucide-react';
