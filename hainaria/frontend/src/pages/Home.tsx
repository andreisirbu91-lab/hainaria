import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import api from '../lib/api';

const CATEGORIES = [
    { title: 'Geci', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600' },
    { title: 'Tricouri', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600' },
    { title: 'Pulovere', image: 'https://images.unsplash.com/photo-1434389678232-04ce6cba1238?auto=format&fit=crop&q=80&w=600' },
    { title: 'Blugi', image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&q=80&w=600' },
    { title: 'Rochii', image: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=600' },
    { title: 'Încălțăminte', image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600' },
];

const HOW_IT_WORKS = [
    { num: '01', title: 'Explorează', desc: 'Răsfoiește colecția de piese second-hand și outlet selectate cu grijă.' },
    { num: '02', title: 'Alege', desc: 'Filtrează după categorie, stare sau brand și găsește piesa perfectă.' },
    { num: '03', title: 'Cumpără', desc: 'Comandă rapid și sigur. Livrare în 2–3 zile, retur în 14 zile.' },
];

export default function Home() {
    const [featured, setFeatured] = useState<any[]>([]);
    const [slide, setSlide] = useState(0);

    useEffect(() => {
        api.get('/products')
            .then(r => setFeatured(r.data.data.slice(0, 8)))
            .catch(() => { });
    }, []);

    // Auto-advance
    useEffect(() => {
        if (featured.length === 0) return;
        const t = setInterval(() => setSlide(s => (s + 1) % featured.length), 4500);
        return () => clearInterval(t);
    }, [featured.length]);

    const prev = () => setSlide(s => (s - 1 + featured.length) % featured.length);
    const next = () => setSlide(s => (s + 1) % featured.length);

    return (
        <div style={{ background: 'var(--bg)' }}>

            {/* ── Hero ── */}
            <section
                className="relative h-[92vh] flex items-center justify-center overflow-hidden"
                style={{ background: '#0f0e0c' }}
            >
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
                        backgroundSize: '64px 64px',
                    }}
                />
                {/* Warm beige glow */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 55%, rgba(201,185,154,0.09) 0%, transparent 70%)' }}
                />

                <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
                    <p className="text-[9px] tracking-[0.55em] uppercase mb-6" style={{ color: 'rgba(201,185,154,0.5)' }}>
                        Colecție 2025
                    </p>
                    <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6 leading-[0.92]">
                        Probează.<br />
                        <span style={{ color: 'rgba(255,255,255,0.35)' }}>Cumpără.</span><br />
                        Virtual.
                    </h1>
                    <p className="text-sm text-white/35 mb-10 max-w-md mx-auto leading-relaxed font-light">
                        Piese second-hand și outlet alese cu grijă. Fashion circular, stil minimalist.
                    </p>
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] px-7 py-4 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.92)', color: '#141414' }}
                    >
                        Explorează colecția <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Scroll cue */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
                    <div className="w-px h-10" style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.2))' }} />
                </div>
            </section>

            {/* ── Featured Slider ── */}
            {featured.length > 0 && (
                <section className="py-20" style={{ background: 'var(--surface)' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.35em] mb-1.5" style={{ color: 'var(--muted)' }}>
                                    Selecție curentă
                                </p>
                                <h2 className="text-xl font-bold uppercase tracking-widest" style={{ color: 'var(--text)' }}>
                                    Produse recomandate
                                </h2>
                            </div>
                            <Link to="/shop" className="btn-ghost btn-sm flex items-center gap-1">
                                Vezi toate <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        <div className="relative group overflow-hidden">
                            <div
                                className="flex transition-transform duration-500 ease-out"
                                style={{ transform: `translateX(-${slide * 25}%)` }}
                            >
                                {featured.map(p => (
                                    <div key={p.id} className="min-w-[50%] md:min-w-[33.333%] lg:min-w-[25%] px-3 flex-shrink-0">
                                        <Link to={`/product/${p.id}`} className="product-card block">
                                            <div className="product-card-img mb-3">
                                                <img src={p.imageUrl} alt={p.title} loading="lazy" />
                                                {p.tag && (
                                                    <span className="badge-dark absolute top-2.5 left-2.5 z-10">{p.tag}</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="min-w-0">
                                                    <h3 className="text-[13px] font-medium truncate" style={{ color: 'var(--text)' }}>{p.title}</h3>
                                                    <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--muted)' }}>
                                                        {p.brand || p.category}
                                                    </p>
                                                </div>
                                                <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: 'var(--text)' }}>
                                                    {p.price} lei
                                                </span>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            {/* Arrows */}
                            {['prev', 'next'].map(dir => (
                                <button
                                    key={dir}
                                    onClick={dir === 'prev' ? prev : next}
                                    className="absolute top-[38%] -translate-y-1/2 w-9 h-9 flex items-center justify-center
                                               border opacity-0 group-hover:opacity-100 transition-all duration-200
                                               hover:border-[var(--text)] hover:bg-[var(--surface-2)]"
                                    style={{
                                        [dir === 'prev' ? 'left' : 'right']: '0',
                                        background: 'var(--surface)',
                                        borderColor: 'var(--border)',
                                        color: 'var(--text)',
                                    }}
                                    aria-label={dir === 'prev' ? 'Anterior' : 'Următor'}
                                >
                                    {dir === 'prev' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>

                        {/* Line dots */}
                        <div className="flex justify-center gap-1.5 mt-6" role="tablist" aria-label="Produse">
                            {featured.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSlide(i)}
                                    role="tab"
                                    aria-selected={i === slide}
                                    aria-label={`Produs ${i + 1}`}
                                    className="h-px transition-all duration-300"
                                    style={{
                                        width: i === slide ? '2rem' : '1rem',
                                        background: i === slide ? 'var(--text)' : 'var(--border)',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Categories ── */}
            <section className="py-20" style={{ background: 'var(--surface-2)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <p className="text-[9px] uppercase tracking-[0.35em] mb-2" style={{ color: 'var(--muted)' }}>
                            Navigare rapidă
                        </p>
                        <h2 className="text-xl font-bold uppercase tracking-widest" style={{ color: 'var(--text)' }}>Categorii</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        {CATEGORIES.map(cat => (
                            <Link
                                key={cat.title}
                                to={`/shop?category=${cat.title}`}
                                className="group relative overflow-hidden border"
                                style={{ aspectRatio: '4/3', borderColor: 'var(--border)' }}
                                aria-label={`Categorie: ${cat.title}`}
                            >
                                <img
                                    src={cat.image}
                                    alt={cat.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div
                                    className="absolute inset-0 flex items-end p-4 transition-colors duration-300"
                                    style={{ background: 'linear-gradient(to top, rgba(15,14,12,0.55) 0%, transparent 55%)' }}
                                >
                                    <span className="text-xs font-bold uppercase tracking-widest text-white">
                                        {cat.title}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="py-20" style={{ background: '#0f0e0c' }}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-[9px] uppercase tracking-[0.45em] mb-3" style={{ color: 'rgba(201,185,154,0.4)' }}>
                        Cum funcționează
                    </p>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-16">
                        Experiența Hainăria
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {HOW_IT_WORKS.map(({ num, title, desc }) => (
                            <div key={num}>
                                <div className="text-5xl font-extralight mb-5" style={{ color: 'rgba(255,255,255,0.1)' }}>
                                    {num}
                                </div>
                                <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-white">{title}</h3>
                                <p className="text-xs leading-relaxed font-light" style={{ color: 'rgba(255,255,255,0.35)' }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-16">
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] px-7 py-3.5 transition-colors border"
                            style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)' }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.4)';
                                (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.8)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.12)';
                                (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)';
                            }}
                        >
                            Începe acum <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
