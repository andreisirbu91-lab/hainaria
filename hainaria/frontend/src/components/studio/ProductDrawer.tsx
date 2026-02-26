import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useStudioStore, Garment } from '../../store/studioStore';

export default function ProductDrawer() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { addGarment, garments, avatarId, setIsProcessingAI, setAiResultUrl } = useStudioStore();

    useEffect(() => {
        // fetch only tryon products
        api.get('/products?tryOn=true')
            .then(res => setProducts(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleAdd = async (p: any) => {
        const conf = p.tryOnConfig;
        if (!conf) return;

        if (!avatarId) {
            alert('Te rugăm să revii la pasul 1 și să reîncarci poza.');
            return;
        }

        setProcessingId(p.id);

        // Only trigger full AI loading overlay if it's NOT an accessory
        const isAI = conf.garmentType !== 'ACCESSORY' && conf.garmentType !== 'SHOES';
        if (isAI) {
            setIsProcessingAI(true);
            setAiResultUrl(null);
        }

        try {
            // Asigurăm cutout-ul local (pentru probe)
            const cutoutRes = await api.post(`/studio/product-cutout/${p.id}`);
            const finalCutoutUrl = cutoutRes.data.cutoutUrl;

            const newLayer: Garment = {
                id: 'layer-' + Date.now(),
                productId: p.id,
                title: p.title,
                price: p.price,
                imageUrl: finalCutoutUrl || p.imageUrl, // Folosim decupajul dacă există
                garmentType: conf.garmentType,
                tryOnConfig: conf
            };
            addGarment(newLayer);

            // Trigger Backend Logic
            const vtonRes = await api.post('/studio/generate-vton', {
                avatarId,
                productId: p.id
            });

            if (vtonRes.data.ok && vtonRes.data.data.resultUrl) {
                // Dacă e haină, înlocuim baza AI. Dacă e accesoriu, ignorăm (rămâne overlay-ul pus deja)
                if (!vtonRes.data.data.isAccessory) {
                    setAiResultUrl(vtonRes.data.data.resultUrl);
                }
            }

        } catch (err) {
            console.error('Eroare Try-On:', err);
            alert('Procesarea a eșuat. Încearcă din nou.');
        } finally {
            setProcessingId(null);
            if (isAI) {
                setIsProcessingAI(false);
            }
        }
    };

    if (loading) return <div className="p-4 text-xs text-center" style={{ color: 'var(--muted)' }}>Se încarcă produse...</div>;

    return (
        <div className="flex flex-col gap-2 p-4 pt-0 overflow-y-auto h-full custom-scrollbar">
            {products.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg border hover:bg-[var(--bg)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <img src={p.imageUrl} alt={p.title} className="w-12 h-16 object-cover rounded bg-white" />
                    <div className="flex-1">
                        <h4 className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>{p.title}</h4>
                        <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{p.category}</p>
                    </div>
                    <button
                        onClick={() => handleAdd(p)}
                        disabled={processingId === p.id}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs border transition-colors disabled:opacity-50"
                        style={{
                            borderColor: 'var(--border)',
                            color: processingId === p.id ? 'var(--muted)' : 'var(--text)',
                            background: processingId === p.id ? 'transparent' : 'var(--surface-2)'
                        }}
                    >
                        {processingId === p.id ? (
                            <span className="w-3 h-3 border-2 border-[var(--muted)] border-t-transparent rounded-full animate-spin" />
                        ) : '+'}
                    </button>
                </div>
            ))}
            {products.length === 0 && <p className="text-xs text-center text-[var(--muted)]">Nu s-au găsit produse Try-On.</p>}
        </div>
    );
}
