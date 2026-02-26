import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useTryOnStore } from '../../../store/tryOnStore';

export default function SelectionStep() {
    const [products, setProducts] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { sessionId, currentResultUrl, pollStatus } = useTryOnStore();

    useEffect(() => {
        api.get('/products?tryOn=true')
            .then(res => setProducts(res.data.data))
            .catch(err => console.error(err));
    }, []);

    const handleTryOn = async () => {
        if (!selectedId || !sessionId) return;
        try {
            await api.post(`/tryon/${sessionId}/try`, { productIds: [selectedId] });
            pollStatus(); // Force status update to TRYON_QUEUED
        } catch (err) {
            alert('Eroare la pornirea procesării AI');
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Pasul 2: Alege Produsul</h3>
                <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                    {products.map(p => (
                        <div
                            key={p.id}
                            onClick={() => setSelectedId(p.id)}
                            className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedId === p.id ? 'border-[var(--text)] scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                            <img src={p.imageUrl} className="w-full aspect-[3/4] object-cover" />
                        </div>
                    ))}
                </div>
                <button
                    onClick={handleTryOn}
                    disabled={!selectedId}
                    className="btn-primary w-full mt-auto disabled:opacity-50"
                >
                    Probează Acum (AI)
                </button>
            </div>

            <div className="bg-black/5 rounded-xl flex items-center justify-center relative border border-[var(--border)] overflow-hidden">
                {currentResultUrl ? (
                    <img src={currentResultUrl} className="h-full w-auto object-contain" />
                ) : (
                    <div className="text-xs text-[var(--muted)]">Poza ta decupată va apărea aici</div>
                )}
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-2 py-1 rounded text-[9px] uppercase font-bold tracking-tighter">
                    Preview Decupaj
                </div>
            </div>
        </div>
    );
}
