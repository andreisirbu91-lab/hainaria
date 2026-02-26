import React from 'react';
import TryOnWizard from './wizard/TryOnWizard';

export default function StudioPage() {
    return (
        <div className="bg-hainaria-bg min-h-screen pt-32 pb-24 px-6">
            <div className="container mx-auto max-w-7xl">
                <header className="mb-16 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-hainaria-muted block mb-4">
                        Experiență Digitală
                    </span>
                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-hainaria-text italic leading-tight">
                        Studio Virtual Try-On
                    </h1>
                    <div className="w-12 h-[1px] bg-hainaria-gold mx-auto mt-8" />
                    <p className="mt-8 text-hainaria-muted text-sm leading-relaxed max-w-2xl mx-auto font-sans">
                        Vizualizează cum prind viață piesele tale preferate. Îmbină tehnologia AI cu stilul personal pentru a găsi ținuta perfectă înainte de achiziție.
                    </p>
                </header>

                <div className="bg-white/40 backdrop-blur-md rounded-[32px] border border-hainaria-border p-8 md:p-12 shadow-2xl">
                    <TryOnWizard />
                </div>
            </div>
        </div>
    );
}
