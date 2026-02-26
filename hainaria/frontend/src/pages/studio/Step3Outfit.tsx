import React from 'react';
import ProductDrawer from '../../components/studio/ProductDrawer';
import AILoader from '../../components/studio/AILoader';
import { useStudioStore } from '../../store/studioStore';

export default function Step3Outfit({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
    const { isProcessingAI, aiResultUrl, originalUrl, cutoutUrl, garments } = useStudioStore();

    // Imaginea de bază arătată în Canvas/Preview este fie rezultatul AI, fie poza decupată, fie cea originală.
    const currentView = aiResultUrl || cutoutUrl || originalUrl;

    return (
        <div className="w-full h-[600px] flex md:flex-row flex-col gap-8">
            <div className="w-full md:w-[300px] flex-shrink-0 flex flex-col h-full rounded-xl overflow-hidden border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                {/* Header Sertar */}
                <div className="flex border-b p-4" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text)]">
                        Haine Disponibile
                    </h3>
                </div>

                {/* Tab content - doar produse, layerele nu mai exista in mod AI */}
                <div className="flex-1 overflow-hidden mt-4">
                    <ProductDrawer />
                </div>

                {/* Actions */}
                <div className="p-4 border-t flex flex-col gap-3" style={{ borderColor: 'var(--border)' }}>
                    <button onClick={onNext} className="btn-primary w-full" disabled={isProcessingAI || garments.length === 0}>
                        Finalizează Ținuta
                    </button>
                    <button onClick={onPrev} className="btn-ghost w-full">Înapoi la poză</button>
                </div>
            </div>

            {/* AI Preview Area */}
            <div className="flex-1 flex items-center justify-center rounded-xl overflow-hidden border relative bg-black/5" style={{ borderColor: 'var(--border)' }}>
                {isProcessingAI ? (
                    <AILoader />
                ) : (
                    currentView ? (
                        <img src={currentView} alt="AI Preview" className="h-full w-auto max-w-full object-contain pointer-events-none" />
                    ) : (
                        <div className="text-sm uppercase tracking-widest text-[var(--muted)]">Selectează un produs</div>
                    )
                )}
            </div>
        </div>
    );
}
