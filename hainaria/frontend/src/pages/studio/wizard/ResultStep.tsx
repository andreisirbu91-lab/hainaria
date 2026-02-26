import React from 'react';
import { useTryOnStore } from '../../../store/tryOnStore';
import { useCartStore } from '../../../store/cartStore';
import { useToast } from '../../../components/ui/Toast';

export default function ResultStep() {
    const { currentResultUrl, reset } = useTryOnStore();
    const { show } = useToast();

    const handleAddToCart = () => {
        // Logica simplificată pentru demo. În realitate, am lua produsele din sesiune.
        show('Ținuta a fost salvată și adăugată în coș!');
    };

    return (
        <div className="flex flex-col items-center gap-8 py-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Wow! Arăți grozav ✨
                </h2>
                <p className="text-[var(--muted)] text-sm">Ținuta ta generată de AI este gata.</p>
            </div>

            <div className="w-full max-w-md aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                {currentResultUrl && (
                    <img src={currentResultUrl} className="w-full h-full object-cover" />
                )}
            </div>

            <div className="flex gap-4 w-full max-w-md">
                <button onClick={reset} className="btn-ghost flex-1">
                    Încearcă altceva
                </button>
                <button onClick={handleAddToCart} className="btn-primary flex-1">
                    Adaugă în Coș
                </button>
            </div>
        </div>
    );
}
