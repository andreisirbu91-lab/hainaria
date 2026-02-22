import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import api from '../lib/api';

export default function Cart() {
    const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const shipping = total() >= 200 ? 0 : 20;
    const grandTotal = total() + shipping;

    const handleCheckout = async () => {
        if (!user) { navigate('/login'); return; }
        try {
            const res = await api.post('/orders/create-checkout-session', {
                items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
            });
            if (res.data.url) window.location.href = res.data.url;
        } catch {
            alert('Comandă simulată plasată cu succes!');
            clearCart();
            navigate('/dashboard');
        }
    };

    /* ── Empty State ── */
    if (items.length === 0) {
        return (
            <div
                className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-4"
                style={{ background: 'var(--bg)' }}
            >
                <div
                    className="w-16 h-16 flex items-center justify-center border"
                    style={{ borderColor: 'var(--border)' }}
                >
                    <ShoppingBag className="w-6 h-6" style={{ color: 'var(--muted)' }} />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text)' }}>
                        Coșul tău e gol
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        Nu ai adăugat nicio piesă încă.
                    </p>
                </div>
                <Link to="/shop" className="btn-primary">
                    Continuă cumpărăturile
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Breadcrumb */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest mb-8 transition-colors"
                    style={{ color: 'var(--muted)' }}
                >
                    <ArrowLeft className="w-3 h-3" /> Continuă cumpărăturile
                </button>

                <div className="flex justify-between items-baseline mb-8">
                    <h1 className="text-3xl font-bold uppercase tracking-widest" style={{ color: 'var(--text)' }}>
                        Coș
                    </h1>
                    <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                        {items.length} {items.length === 1 ? 'produs' : 'produse'}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* ── Items ── */}
                    <div className="lg:col-span-2">
                        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                            {items.map((item) => (
                                <div key={item.productId} className="flex items-start gap-5 py-6">
                                    {/* Thumb */}
                                    <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                                        <div
                                            className="w-[70px] h-[93px] overflow-hidden border"
                                            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
                                        >
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        </div>
                                    </Link>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3
                                            className="text-[13px] font-semibold leading-snug truncate mb-0.5"
                                            style={{ color: 'var(--text)' }}
                                        >
                                            {item.title}
                                        </h3>
                                        <p className="text-[10px] uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>
                                            Stoc limitat
                                        </p>

                                        {/* Price + qty row */}
                                        <div className="flex items-center gap-5">
                                            {/* Qty stepper */}
                                            <div className="qty-stepper" role="group" aria-label="Cantitate">
                                                <button
                                                    className="qty-stepper-btn"
                                                    onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                                    aria-label="Scade cantitatea"
                                                >−</button>
                                                <span className="qty-stepper-val">{item.quantity}</span>
                                                <button
                                                    className="qty-stepper-btn"
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    aria-label="Mărește cantitatea"
                                                >+</button>
                                            </div>

                                            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                                                {(item.price * item.quantity).toFixed(0)} lei
                                            </span>
                                        </div>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        onClick={() => removeItem(item.productId)}
                                        className="p-2 mt-1 transition-colors"
                                        style={{ color: 'var(--muted)' }}
                                        aria-label={`Șterge ${item.title}`}
                                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--error)')}
                                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Summary ── */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 card p-7 flex flex-col gap-5">
                            <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--muted)' }}>
                                Sumar comandă
                            </h2>

                            {/* Line items */}
                            <div className="space-y-3 text-sm">
                                {items.map(i => (
                                    <div key={i.productId} className="flex justify-between" style={{ color: 'var(--muted)' }}>
                                        <span className="truncate flex-1 pr-2">{i.title}
                                            {i.quantity > 1 && <span className="ml-1 text-[10px]">×{i.quantity}</span>}
                                        </span>
                                        <span className="font-medium whitespace-nowrap" style={{ color: 'var(--text)' }}>
                                            {(i.price * i.quantity).toFixed(0)} lei
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="divider" />

                            {/* Subtotal / shipping */}
                            <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between" style={{ color: 'var(--muted)' }}>
                                    <span>Subtotal</span>
                                    <span>{total().toFixed(0)} lei</span>
                                </div>
                                <div className="flex justify-between" style={{ color: 'var(--muted)' }}>
                                    <span>Transport</span>
                                    <span>
                                        {shipping === 0
                                            ? <span style={{ color: 'var(--success)' }}>Gratuit</span>
                                            : `${shipping} lei`}
                                    </span>
                                </div>
                            </div>

                            <div className="divider" />

                            {/* Total */}
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
                                    Total
                                </span>
                                <span className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                                    {grandTotal.toFixed(0)} lei
                                </span>
                            </div>

                            {/* Free shipping hint */}
                            {shipping > 0 && (
                                <p className="text-[10px] uppercase tracking-widest text-center" style={{ color: 'var(--muted)' }}>
                                    Mai adaugă {(200 - total()).toFixed(0)} lei pentru transport gratuit
                                </p>
                            )}

                            {/* CTA */}
                            <button onClick={handleCheckout} className="btn-primary btn-lg w-full mt-1">
                                Finalizează comanda
                            </button>
                            <button onClick={() => navigate('/shop')} className="btn-ghost btn-sm w-full">
                                ← Înapoi la colecție
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
