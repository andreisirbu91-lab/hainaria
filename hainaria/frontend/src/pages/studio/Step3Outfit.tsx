import React from 'react';
import ProductDrawer from '../../components/studio/ProductDrawer';
import AILoader from '../../components/studio/AILoader';
import { useStudioStore } from '../../store/studioStore';
import { useCartStore } from '../../store/cartStore';
import { useToast } from '../../components/ui/Toast';

export default function Step3Outfit({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
    const { isProcessingAI, aiResultUrl, originalUrl, cutoutUrl, garments } = useStudioStore();
    const { addItem } = useCartStore();
    const { show } = useToast();

    // Imaginea de bază: rezultatul AI > decupajul userului > poza originală (fallback)
    const baseView = aiResultUrl || cutoutUrl || originalUrl;

    // Accesoriile și încălțămintea sunt randate ca layere suprapuse (Overlay)
    const overlays = garments.filter(g => g.garmentType === 'ACCESSORY' || g.garmentType === 'SHOES');

    const handleFinalize = () => {
        if (garments.length === 0) return;

        garments.forEach(g => {
            addItem({
                productId: g.productId,
                title: g.title,
                price: g.price,
                imageUrl: g.imageUrl,
                quantity: 1
            });
        });

        show(`Am adăugat ${garments.length} produse în coș!`);
        onNext();
    };

    return (
        <div className="w-full h-[600px] flex md:flex-row flex-col gap-8">
            <div className="w-full md:w-[300px] flex-shrink-0 flex flex-col h-full rounded-xl overflow-hidden border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="flex border-b p-4" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text)]">
                        Haine Disponibile
                    </h3>
                </div>

                <div className="flex-1 overflow-hidden mt-4">
                    <ProductDrawer />
                </div>

                <div className="p-4 border-t flex flex-col gap-3" style={{ borderColor: 'var(--border)' }}>
                    <button
                        onClick={handleFinalize}
                        className="btn-primary w-full"
                        disabled={isProcessingAI || garments.length === 0}
                    >
                        Adaugă Ținuta în Coș
                    </button>
                    <button onClick={onPrev} className="btn-ghost w-full">Înapoi la poză</button>
                </div>
            </div>

            {/* AI + Overlay Preview Area */}
            <div className="flex-1 flex items-center justify-center rounded-xl overflow-hidden border relative bg-black/5" style={{ borderColor: 'var(--border)' }}>
                {isProcessingAI ? (
                    <AILoader />
                ) : (
                    baseView ? (
                        <div className="relative h-full aspect-[2/3] flex items-center justify-center">
                            {/* Base Image (User or AI Result) */}
                            <img
                                src={baseView}
                                alt="AI Base"
                                className="h-full w-auto object-contain pointer-events-none"
                            />

                            {/* Accessory Layers */}
                            {overlays.map(g => (
                                <div
                                    key={g.id}
                                    className="absolute pointer-events-none transition-transform"
                                    style={{
                                        left: `${(g.tryOnConfig?.anchorX || 0.5) * 100}%`,
                                        top: `${(g.tryOnConfig?.anchorY || 0.5) * 100}%`,
                                        transform: `translate(-50%, -50%) scale(${g.tryOnConfig?.scale || 1.0}) rotate(${g.tryOnConfig?.rotationDeg || 0}deg)`,
                                        width: '40%', // Default relative width for accessories
                                    }}
                                >
                                    <img src={g.imageUrl} alt={g.title} className="w-full h-auto" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm uppercase tracking-widest text-[var(--muted)]">Selectează un produs</div>
                    )
                )}
            </div>
        </div>
    );
}
