import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ArrowRight, Sparkles } from 'lucide-react';
import api from '../lib/api';

/* ── Hero Images (Warm Autumn Editorial) ── */
const HERO_SLIDES = [
    {
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=85&w=1920',
        subtitle: 'Colecție Toamnă 2025',
        title: 'Eleganță\nÎntemporală',
        cta: 'Descoperă Colecția',
        link: '/shop'
    },
    {
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=85&w=1920',
        subtitle: 'Stil Exclusiv',
        title: 'Redefinim\nFashion-ul',
        cta: 'Explorează',
        link: '/shop'
    },
    {
        image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?auto=format&fit=crop&q=85&w=1920',
        subtitle: 'Studio Virtual',
        title: 'Probează.\nVirtual.',
        cta: 'Deschide Studio',
        link: '/studio'
    },
];

const CATEGORIES = [
    { title: 'Geci & Paltoane', image: 'https://images.unsplash.com/photo-1544923246-77307dd270b5?auto=format&fit=crop&q=80&w=600', link: '/shop?category=Geci' },
    { title: 'Tricouri', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600', link: '/shop?category=Tricouri' },
    { title: 'Pulovere', image: 'https://images.unsplash.com/photo-1434389678232-04ce6cba1238?auto=format&fit=crop&q=80&w=600', link: '/shop?category=Pulovere' },
    { title: 'Blugi', image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&q=80&w=600', link: '/shop?category=Blugi' },
    { title: 'Rochii', image: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=600', link: '/shop?category=Rochii' },
    { title: 'Încălțăminte', image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600', link: '/shop?category=Încălțăminte' },
];

const HOW_IT_WORKS = [
    { num: '01', title: 'Explorează', desc: 'Răsfoiește colecția de piese second-hand și outlet selectate cu grijă.', icon: '🔍' },
    { num: '02', title: 'Probează Virtual', desc: 'Folosește Studio AI pentru a proba hainele direct pe tine, fără dressingroom.', icon: '✨' },
    { num: '03', title: 'Cumpără', desc: 'Comandă rapid și sigur. Livrare în 2–3 zile, retur gratuit în 14 zile.', icon: '🛍️' },
];

export default function Home() {
    const [featured, setFeatured] = useState<any[]>([]);
    const [slide, setSlide] = useState(0);
    const [heroSlide, setHeroSlide] = useState(0);
    const [heroLoaded, setHeroLoaded] = useState(false);

    useEffect(() => {
        api.get('/products')
            .then(r => setFeatured(r.data.data.slice(0, 8)))
            .catch(() => { });
    }, []);

    // Auto-advance featured slider
    useEffect(() => {
        if (featured.length === 0) return;
        const t = setInterval(() => setSlide(s => (s + 1) % featured.length), 4500);
        return () => clearInterval(t);
    }, [featured.length]);

    // Auto-advance hero slider
    useEffect(() => {
        const t = setInterval(() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length), 6000);
        return () => clearInterval(t);
    }, []);

    // Preload hero images
    useEffect(() => {
        const img = new Image();
        img.src = HERO_SLIDES[0].image;
        img.onload = () => setHeroLoaded(true);
    }, []);

    const prev = () => setSlide(s => (s - 1 + featured.length) % featured.length);
    const next = () => setSlide(s => (s + 1) % featured.length);
    const currentHero = HERO_SLIDES[heroSlide];

    return (
        <div style={{ background: 'var(--bg)' }}>

            {/* ══════════════════════════════════════════════════════════════
                 HERO — Full-screen editorial image with elegant overlay
                ══════════════════════════════════════════════════════════════ */}
            <section className="relative h-[100vh] min-h-[600px] overflow-hidden">
                {/* Background images with crossfade */}
                {HERO_SLIDES.map((sl, i) => (
                    <div
                        key={i}
                        className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
                        style={{ opacity: heroSlide === i ? 1 : 0 }}
                    >
                        <img
                            src={sl.image}
                            alt=""
                            className="w-full h-full object-cover object-center"
                            style={{ filter: 'brightness(0.65) contrast(1.05) saturate(1.1)' }}
                            loading={i === 0 ? 'eager' : 'lazy'}
                        />
                    </div>
                ))}

                {/* Warm cinematic overlay */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `
                            linear-gradient(180deg, rgba(15,12,8,0.3) 0%, rgba(15,12,8,0.1) 40%, rgba(15,12,8,0.6) 100%),
                            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(139,90,43,0.15) 0%, transparent 60%)
                        `
                    }}
                />

                {/* Grain texture */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.04]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
                    }}
                />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end pb-20 sm:pb-24 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
                    <div className="max-w-2xl">
                        <p
                            className="text-[10px] sm:text-[11px] uppercase tracking-[0.4em] mb-4 font-medium transition-opacity duration-700"
                            style={{
                                color: 'rgba(201,185,154,0.85)',
                                opacity: heroLoaded ? 1 : 0,
                                transform: heroLoaded ? 'none' : 'translateY(10px)',
                                transition: 'all 0.8s ease-out 0.3s',
                            }}
                        >
                            {currentHero.subtitle}
                        </p>
                        <h1
                            className="text-5xl sm:text-6xl lg:text-8xl font-bold text-white leading-[0.9] mb-8 whitespace-pre-line"
                            style={{
                                textShadow: '0 2px 40px rgba(0,0,0,0.3)',
                                opacity: heroLoaded ? 1 : 0,
                                transform: heroLoaded ? 'none' : 'translateY(20px)',
                                transition: 'all 0.8s ease-out 0.5s',
                            }}
                        >
                            {currentHero.title}
                        </h1>
                        <div
                            className="flex flex-wrap items-center gap-4"
                            style={{
                                opacity: heroLoaded ? 1 : 0,
                                transform: heroLoaded ? 'none' : 'translateY(15px)',
                                transition: 'all 0.8s ease-out 0.7s',
                            }}
                        >
                            <Link
                                to={currentHero.link}
                                className="group inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] px-8 py-4 transition-all duration-300 hover:gap-4"
                                style={{ background: 'rgba(255,255,255,0.95)', color: '#141414' }}
                            >
                                {currentHero.cta}
                                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                            <Link
                                to="/studio"
                                className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] px-6 py-4 transition-all duration-300 border"
                                style={{
                                    borderColor: 'rgba(255,255,255,0.25)',
                                    color: 'rgba(255,255,255,0.85)',
                                    backdropFilter: 'blur(4px)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
                                    e.currentTarget.style.color = '#fff';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Probează Virtual
                            </Link>
                        </div>
                    </div>

                    {/* Hero slide indicators */}
                    <div className="absolute bottom-8 right-6 sm:right-12 lg:right-20 flex items-center gap-3">
                        {HERO_SLIDES.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setHeroSlide(i)}
                                className="transition-all duration-500"
                                aria-label={`Slide ${i + 1}`}
                                style={{
                                    width: heroSlide === i ? '2rem' : '0.5rem',
                                    height: '2px',
                                    background: heroSlide === i ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                                }}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                 EDITORIAL BANNER — Split Hero ("Curated for You")
                ══════════════════════════════════════════════════════════════ */}
            <section className="py-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div
                        className="flex flex-col justify-center px-8 sm:px-16 py-16 md:py-24"
                        style={{ background: '#1a1714' }}
                    >
                        <p className="text-[10px] uppercase tracking-[0.4em] mb-4" style={{ color: 'rgba(201,185,154,0.6)' }}>
                            De ce Hainăria
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-6">
                            Modă Circulară,<br />
                            <span style={{ color: 'var(--accent)' }}>Stil Impecabil</span>
                        </h2>
                        <p className="text-sm font-light leading-relaxed mb-8 max-w-md" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            Fiecare piesă din colecția noastră este selectată manual, verificată și pregătită pentru
                            o a doua viață. Sustenabilitate fără compromisuri.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-7 py-3.5 transition-all duration-300"
                                style={{ background: 'var(--accent)', color: '#1a1714' }}
                            >
                                Vezi Colecția <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                                to="/studio"
                                className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] px-6 py-3.5 transition-all duration-300 border"
                                style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'rgba(201,185,154,0.5)';
                                    e.currentTarget.style.color = 'var(--accent)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                                }}
                            >
                                Deschide Studio AI
                            </Link>
                        </div>
                    </div>
                    <div className="relative h-[400px] md:h-auto overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=85&w=900"
                            alt="Fashion editorial"
                            className="w-full h-full object-cover"
                            style={{ filter: 'brightness(0.9) saturate(1.1)' }}
                            loading="lazy"
                        />
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: 'linear-gradient(90deg, rgba(26,23,20,0.4) 0%, transparent 50%)' }}
                        />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                 FEATURED PRODUCTS SLIDER
                ══════════════════════════════════════════════════════════════ */}
            {featured.length > 0 && (
                <section className="py-20 sm:py-24" style={{ background: 'var(--surface)' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.4em] mb-2" style={{ color: 'var(--accent-2)' }}>
                                    Selecție curentă
                                </p>
                                <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
                                    Produse Recomandate
                                </h2>
                            </div>
                            <Link to="/shop" className="hidden sm:inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-3 border transition-all duration-200 hover:border-[var(--text)] hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                                Vezi Toate <ArrowRight className="w-3 h-3" />
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
                                    className="absolute top-[38%] -translate-y-1/2 w-10 h-10 flex items-center justify-center
                                               border opacity-0 group-hover:opacity-100 transition-all duration-200
                                               hover:border-[var(--text)] hover:bg-[var(--surface-2)]"
                                    style={{
                                        [dir === 'prev' ? 'left' : 'right']: '4px',
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
                        <div className="flex justify-center gap-1.5 mt-8" role="tablist" aria-label="Produse">
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

                        {/* Mobile CTA */}
                        <div className="sm:hidden text-center mt-8">
                            <Link to="/shop" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-3 border transition-all duration-200" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                                Vezi Toate Produsele <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ══════════════════════════════════════════════════════════════
                 CATEGORIES — Elegant Grid with CTAs
                ══════════════════════════════════════════════════════════════ */}
            <section className="py-20 sm:py-24" style={{ background: 'var(--surface-2)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <p className="text-[9px] uppercase tracking-[0.4em] mb-3" style={{ color: 'var(--accent-2)' }}>
                            Navigare Rapidă
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
                            Colecții
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                        {CATEGORIES.map(cat => (
                            <Link
                                key={cat.title}
                                to={cat.link}
                                className="group relative overflow-hidden"
                                style={{ aspectRatio: '4/3' }}
                                aria-label={`Categorie: ${cat.title}`}
                            >
                                <img
                                    src={cat.image}
                                    alt={cat.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                />
                                {/* Warm gradient overlay */}
                                <div
                                    className="absolute inset-0 transition-all duration-500"
                                    style={{
                                        background: 'linear-gradient(to top, rgba(15,12,8,0.75) 0%, rgba(15,12,8,0.15) 50%, rgba(15,12,8,0.05) 100%)'
                                    }}
                                />
                                {/* Content */}
                                <div className="absolute inset-0 flex flex-col items-start justify-end p-5 sm:p-6">
                                    <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-white mb-2 drop-shadow-lg">
                                        {cat.title}
                                    </span>
                                    <span
                                        className="text-[9px] font-medium uppercase tracking-[0.25em] flex items-center gap-1.5 transition-all duration-300
                                                   opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                                        style={{ color: 'var(--accent)' }}
                                    >
                                        Descoperă <ArrowRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* CTA buton la colecții */}
                    <div className="text-center mt-12">
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-4 transition-all duration-200 border hover:bg-[var(--text)] hover:text-[var(--bg)] hover:border-[var(--text)]"
                            style={{ borderColor: 'var(--border-2)', color: 'var(--text)' }}
                        >
                            Vezi Întreaga Colecție <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                 HOW IT WORKS — Premium Dark Section
                ══════════════════════════════════════════════════════════════ */}
            <section className="py-24 sm:py-28" style={{ background: '#130f0a' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <p className="text-[10px] uppercase tracking-[0.5em] mb-4" style={{ color: 'var(--accent)' }}>
                            Experiența Hainăria
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-wider">
                            Cum Funcționează
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
                        {HOW_IT_WORKS.map(({ num, title, desc, icon }) => (
                            <div key={num} className="text-center md:text-left">
                                <div className="text-3xl mb-5">{icon}</div>
                                <div className="flex items-baseline gap-3 mb-4 justify-center md:justify-start">
                                    <span className="text-4xl font-extralight" style={{ color: 'rgba(201,185,154,0.2)' }}>
                                        {num}
                                    </span>
                                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">{title}</h3>
                                </div>
                                <p className="text-xs leading-relaxed font-light max-w-xs mx-auto md:mx-0" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                    {desc}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-16">
                        <Link
                            to="/shop"
                            className="group inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] px-8 py-4 transition-all duration-300"
                            style={{ background: 'var(--accent)', color: '#130f0a' }}
                        >
                            Începe Acum
                            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                 FOOTER CTA BANNER
                ══════════════════════════════════════════════════════════════ */}
            <section className="relative py-20 sm:py-24 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1920"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: 'brightness(0.35) saturate(1.2)' }}
                    loading="lazy"
                />
                <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(135deg, rgba(26,23,20,0.7) 0%, rgba(139,90,43,0.1) 100%)' }}
                />
                <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
                    <p className="text-[10px] uppercase tracking-[0.5em] mb-4" style={{ color: 'var(--accent)' }}>
                        Nu rata nimic
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
                        Fii Primul Care Descoperă<br />
                        Piesele Noi
                    </h2>
                    <p className="text-sm font-light mb-10 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        Abonează-te la newsletter și primești 10% reducere la prima comandă,
                        plus acces anticipat la colecțiile noi.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="adresa@email.com"
                            className="flex-1 px-5 py-4 text-sm bg-white/10 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-white/40 transition-colors"
                            style={{ backdropFilter: 'blur(4px)' }}
                        />
                        <button
                            className="inline-flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-7 py-4 transition-all duration-300 hover:opacity-90"
                            style={{ background: 'var(--accent)', color: '#1a1714' }}
                        >
                            Abonează-te
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
}
