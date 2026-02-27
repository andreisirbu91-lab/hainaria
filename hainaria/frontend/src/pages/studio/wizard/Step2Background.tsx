import React from 'react';
import { useTryOnStore } from '../../../store/tryonStore';
import { Scissors, Loader2, CheckCircle2 } from 'lucide-react';

export default function Step2Background() {
    const { session, startBgRemove } = useTryOnStore();

    const isQueued = session?.status === 'BG_REMOVAL_QUEUED';
    const rawImage = session?.assets.find(a => a.type === 'RAW')?.url;

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black italic tracking-tighter uppercase">Pasul 2: Pregătește Modelul</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    Eliminăm fundalul automat pentru a permite AI-ului să te "îmbrace" corect.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="aspect-[4/5] bg-gray-100 rounded-[2.5rem] overflow-hidden border shadow-2xl relative group">
                    {rawImage && <img src={rawImage} className="w-full h-full object-contain" alt="Original" />}

                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />

                    {isQueued && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center gap-6">
                            <div className="relative">
                                <Loader2 className="animate-spin text-black" size={60} />
                                <Scissors className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={20} />
                            </div>
                            <div>
                                <p className="text-xl font-black italic uppercase tracking-tighter">Se procesează fundalul</p>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Te rugăm să nu închizi pagina</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase">Ce facem acum?</h3>
                        <div className="space-y-4">
                            {[
                                'Analizăm silueta și postura ta',
                                'Eliminăm obiectele parazite din fundal',
                                'Decupăm precis conturul corpului',
                                'Normalizăm imaginea pentru motorul AI'
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="text-green-500" size={20} />
                                    <span className="text-sm font-medium text-gray-600 italic">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {!isQueued && (
                        <button
                            onClick={startBgRemove}
                            className="w-full bg-black text-white py-6 rounded-2xl font-black italic uppercase tracking-widest text-sm hover:scale-[1.02] shadow-xl hover:shadow-black/20 transition-all flex items-center justify-center gap-4 group"
                        >
                            <Scissors className="group-hover:rotate-12 transition-transform" />
                            Începe Decuparea
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
