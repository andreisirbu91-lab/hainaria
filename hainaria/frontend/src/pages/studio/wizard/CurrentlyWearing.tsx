import React from 'react';
import { useTryOnStore } from '../../../store/tryonStore';
import { X, ShoppingBag, Info } from 'lucide-react';

export default function CurrentlyWearing() {
    const { session } = useTryOnStore();

    // In a real app, we'd track multiple items. For now, we show the result and the base cutout.
    const resultImage = session?.currentResultUrl;
    const cutoutImage = session?.assets.find(a => a.type === 'CUTOUT')?.url;

    return (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden sticky top-8">
            <header className="px-8 py-6 border-b flex items-center justify-between bg-black text-white">
                <div className="flex items-center gap-3">
                    <ShoppingBag size={20} className="text-indigo-400" />
                    <h3 className="text-sm font-black italic uppercase tracking-tighter">Outfit-ul Tău</h3>
                </div>
                <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full font-bold">BETA</span>
            </header>

            <div className="p-8 space-y-8">
                {/* Visual Preview */}
                <div className="aspect-[3/4] bg-[#F9FAFB] rounded-2xl overflow-hidden border border-gray-50 relative group">
                    {(resultImage || cutoutImage) ? (
                        <img
                            src={resultImage || cutoutImage}
                            className="w-full h-full object-cover transition-opacity duration-500"
                            alt="Preview"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-xs p-6 text-center">
                            Încarcă o poză pentru a începe compunerea outfit-ului
                        </div>
                    )}

                    {resultImage && (
                        <div className="absolute top-4 left-4">
                            <span className="px-2 py-1 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1">
                                <span className="w-1 h-1 bg-green-500 rounded-full animate-ping" /> GENERAȚIE AI
                            </span>
                        </div>
                    )}
                </div>

                {/* Items List */}
                <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Haine Probante</p>

                    {session?.status === 'TRYON_DONE' ? (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl relative group">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                {/* Product thumb here */}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">Produs Probat</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Scoatere din outfit</p>
                            </div>
                            <button className="p-1 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-300 italic p-4 border border-dashed rounded-xl border-gray-100 text-center">
                            Niciun produs selectat
                        </p>
                    )}
                </div>

                <div className="pt-6 border-t border-gray-50">
                    <div className="flex items-start gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                        <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-indigo-700 font-medium italic leading-relaxed">
                            Poți adăuga mai multe piese pentru a vedea cum se asortează. AI-ul va procesa noua combinație.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
