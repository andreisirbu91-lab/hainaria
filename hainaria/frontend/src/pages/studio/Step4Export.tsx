import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudioStore } from '../../store/studioStore';
import { useCartStore } from '../../store/cartStore';
import api, { getErrorMessage } from '../../lib/api';

export default function Step4Export({ onPrev }: { onPrev: () => void }) {
    const { garments, avatarId, aiResultUrl, originalUrl } = useStudioStore();
    const { addItem } = useCartStore();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (!name) { setError('Introdu un nume pentru ținută.'); return; }
        setLoading(true); setError('');
        try {
            const sceneJson = { garments, aiResultUrl, isAiGenerated: true };
            await api.post('/studio/looks', {
                avatarId,
                name,
                sceneJson,
                previewUrl: aiResultUrl
            });
            setSaved(true);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        const urlToDownload = aiResultUrl || originalUrl;
        if (!urlToDownload) return;
        try {
            const res = await fetch(urlToDownload);
            const blob = await res.blob();
            const link = document.createElement('a');
            link.download = `hainaria-ai-look-${Date.now()}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error('Eroare download:', err);
            alert('Eroare descărcare imagine.');
        }
    };

    const handleAddToCart = () => {
        garments.forEach(g => {
            addItem({
                productId: g.productId,
                title: g.title,
                price: g.price,
                imageUrl: g.imageUrl,
                quantity: 1
            });
        });
        navigate('/cart');
    };

    const currentImg = aiResultUrl || originalUrl;

    return (
        <div className="w-full h-[600px] flex md:flex-row flex-col gap-8">
            <div className="w-full md:w-[300px] flex-shrink-0 flex flex-col h-full rounded-xl overflow-hidden border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <h2 className="text-[13px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text)' }}>Ținută Gata!</h2>
                <p className="text-[10px] uppercase tracking-widest mb-6" style={{ color: 'var(--muted)' }}>Salvează sau descarcă</p>

                {saved ? (
                    <div className="flex flex-col gap-4 text-center mt-10">
                        <div className="w-12 h-12 rounded-full border mx-auto flex items-center justify-center" style={{ borderColor: 'var(--success, #22c55e)', color: 'var(--success, #22c55e)' }}>✓</div>
                        <p className="text-sm">Ținuta a fost salvată în profilul tău!</p>
                        <button onClick={onPrev} className="btn-ghost mt-4">← Către Editare</button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: 'var(--muted)' }}>Nume Ținută</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => { setName(e.target.value); setError(''); }}
                                placeholder="ex. Casual Vibe AI"
                                className="w-full p-3 border rounded text-sm bg-transparent"
                                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                            />
                            {error && <span className="text-xs text-[var(--error)] mt-1">{error}</span>}
                        </div>

                        <button onClick={handleSave} disabled={loading} className="btn-primary w-full mt-4">
                            {loading ? 'Se salvează...' : 'Salvează în Profil'}
                        </button>

                        {garments.length > 0 && (
                            <button onClick={handleAddToCart} className="btn-secondary w-full text-[10px] py-4 bg-[var(--text)] text-[var(--bg)] transition hover:opacity-80 font-bold uppercase tracking-widest border" style={{ borderColor: 'var(--border)' }}>
                                Adaugă Toate În Coș
                            </button>
                        )}

                        <button onClick={handleDownload} className="btn-ghost border w-full text-[10px]" style={{ borderColor: 'var(--border)' }}>
                            Descarcă Imagine (PNG)
                        </button>
                        <button onClick={onPrev} className="btn-ghost w-full mt-2 text-[10px]">
                            ← Înapoi la editare
                        </button>
                    </div>
                )}
            </div>

            {/* Readonly preview AI Result */}
            <div className="flex-1 flex items-center justify-center rounded-xl overflow-hidden border pointer-events-none opacity-90 relative" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                {currentImg ? (
                    <img src={currentImg} alt="Final AI Look" className="h-full w-auto max-w-full object-contain shadow-xl" />
                ) : (
                    <div className="text-sm uppercase tracking-widest text-[var(--muted)]">Nu s-a încărcat o poză</div>
                )}
            </div>
        </div>
    );
}
